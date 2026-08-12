/* ============================================================
   DADOS DO PACOTE (fixos — o usuário só informa o CEP de destino)
   ============================================================ */
const PRODUTO = {
  nome: "Fone de Ouvido NeoWave X200",
  preco: 249.90,
  peso: 0.4,        // kg
  altura: 8,         // cm
  largura: 18,       // cm
  comprimento: 20    // cm
};

const CEP_ORIGEM = "01310930"; // CEP fixo da loja (fictício)
const ALIQUOTA_IMPOSTO = 0.07;  // imposto estimado (simulado para fins acadêmicos)

/* ============================================================
   ELEMENTOS
   ============================================================ */
const cepInput        = document.getElementById('cep');
const cepStatus       = document.getElementById('cep-status');
const cepErro         = document.getElementById('cep-erro');
const enderecoCard    = document.getElementById('endereco-card');
const endLogradouro   = document.getElementById('end-logradouro');
const endBairro       = document.getElementById('end-bairro');
const endCidade       = document.getElementById('end-cidade');

const etapaFrete       = document.getElementById('etapa-frete');
const freteLista       = document.getElementById('frete-lista');
const freteCarregando  = document.getElementById('frete-carregando');
const freteErro        = document.getElementById('frete-erro');

const recSubtotal   = document.getElementById('rec-subtotal');
const recFrete       = document.getElementById('rec-frete');
const recImposto     = document.getElementById('rec-imposto');
const recTotal       = document.getElementById('rec-total');
const codigoTexto    = document.getElementById('codigo-texto');
const seloConfirmado = document.getElementById('selo-confirmado');
const reciboNota      = document.getElementById('recibo-nota');
const btnFinalizar    = document.getElementById('btn-finalizar');

let freteSelecionado = null; // { preco, prazo, nome }

/* ============================================================
   HELPERS
   ============================================================ */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mascaraCep(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  if (digitos.length > 5) return digitos.slice(0, 5) + '-' + digitos.slice(5);
  return digitos;
}

// preenche a maquete inicial do card de produto
document.getElementById('produto-nome').textContent = PRODUTO.nome;
document.getElementById('produto-preco').textContent = formatarMoeda(PRODUTO.preco);
document.getElementById('produto-medidas').textContent =
  `${PRODUTO.peso.toString().replace('.', ',')} kg · ${PRODUTO.altura} × ${PRODUTO.largura} × ${PRODUTO.comprimento} cm`;
recSubtotal.textContent = formatarMoeda(PRODUTO.preco);

/* ============================================================
   ETAPA 1 — CEP + VIACEP (chamada direta, API pública)
   ============================================================ */
cepInput.addEventListener('input', (e) => {
  e.target.value = mascaraCep(e.target.value);
  cepErro.textContent = '';
});

cepInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarEndereco();
});

cepInput.addEventListener('blur', buscarEndereco);

async function buscarEndereco() {
  const cep = cepInput.value.replace(/\D/g, '');
  cepErro.textContent = '';
  enderecoCard.hidden = true;
  etapaFrete.hidden = true;
  resetarRecibo();

  if (cep.length === 0) return;

  if (cep.length !== 8) {
    cepErro.textContent = 'Digite os 8 números do CEP.';
    return;
  }

  cepStatus.className = 'cep-status carregando';
  cepStatus.textContent = '';

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      cepStatus.className = 'cep-status';
      cepStatus.textContent = '';
      cepErro.textContent = 'CEP não encontrado.';
      return;
    }

    endLogradouro.textContent = dados.logradouro || '(sem logradouro)';
    endBairro.textContent = dados.bairro || '';
    endCidade.textContent = `${dados.localidade} — ${dados.uf}`;
    enderecoCard.hidden = false;

    cepStatus.className = 'cep-status ok';
    cepStatus.textContent = '✓';

    // com o endereço confirmado, já dispara o cálculo de frete
    buscarFrete(cep);
  } catch (err) {
    cepStatus.className = 'cep-status';
    cepStatus.textContent = '';
    cepErro.textContent = 'Erro ao consultar o CEP. Tente novamente.';
    console.error(err);
  }
}

/* ============================================================
   ETAPA 2 — FRETE (Melhor Envio Sandbox, via backend)
   O token do Melhor Envio fica protegido no servidor, então o
   front-end chama o nosso backend, que repassa para a API.
   ============================================================ */
async function buscarFrete(cepDestino) {
  etapaFrete.hidden = false;
  freteLista.innerHTML = '';
  freteCarregando.hidden = false;
  freteErro.textContent = '';
  freteSelecionado = null;
  btnFinalizar.disabled = true;

  try {
    const resposta = await fetch('/api/frete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cepOrigem: CEP_ORIGEM,
        cepDestino,
        peso: PRODUTO.peso,
        altura: PRODUTO.altura,
        largura: PRODUTO.largura,
        comprimento: PRODUTO.comprimento,
        valorSegurado: PRODUTO.preco
      })
    });

    const dados = await resposta.json();
    freteCarregando.hidden = true;

    if (!resposta.ok) {
      freteErro.textContent = dados.mensagem || 'Erro ao calcular o frete.';
      return;
    }

    exibirOpcoesFrete(dados);
  } catch (err) {
    freteCarregando.hidden = true;
    freteErro.textContent = 'Não foi possível se conectar ao servidor de frete.';
    console.error(err);
  }
}

function exibirOpcoesFrete(opcoes) {
  const validas = (opcoes || []).filter(op => !op.error && op.price);
  freteLista.innerHTML = '';

  if (validas.length === 0) {
    freteErro.textContent = 'Nenhuma transportadora disponível para esse CEP no sandbox.';
    return;
  }

  validas
    .sort((a, b) => Number(a.price) - Number(b.price))
    .forEach((op, indice) => {
      const id = `frete-op-${indice}`;
      const label = document.createElement('label');
      label.className = 'frete-opcao';
      label.setAttribute('for', id);
      label.innerHTML = `
        <input type="radio" name="frete" id="${id}">
        <span class="frete-opcao-info">
          <span class="frete-opcao-nome">${op.company ? op.company.name : 'Transportadora'} · ${op.name}</span>
          <span class="frete-opcao-prazo">Prazo estimado: ${op.delivery_time} dia(s) útil(eis)</span>
        </span>
        <span class="frete-opcao-preco">${formatarMoeda(Number(op.price))}</span>
      `;

      const radio = label.querySelector('input');
      radio.addEventListener('change', () => selecionarFrete(label, {
        nome: `${op.company ? op.company.name : 'Transportadora'} · ${op.name}`,
        preco: Number(op.price),
        prazo: Number(op.delivery_time)
      }));

      freteLista.appendChild(label);

      // seleciona automaticamente a opção mais barata
      if (indice === 0) {
        radio.checked = true;
        selecionarFrete(label, {
          nome: `${op.company ? op.company.name : 'Transportadora'} · ${op.name}`,
          preco: Number(op.price),
          prazo: Number(op.delivery_time)
        });
      }
    });
}

function selecionarFrete(labelEl, dados) {
  document.querySelectorAll('.frete-opcao').forEach(el => el.classList.remove('selecionada'));
  labelEl.classList.add('selecionada');
  freteSelecionado = dados;
  atualizarRecibo();
  btnFinalizar.disabled = false;
}

/* ============================================================
   RECIBO — resumo de custos
   ============================================================ */
function atualizarRecibo() {
  if (!freteSelecionado) return;

  const subtotal = PRODUTO.preco;
  const frete = freteSelecionado.preco;
  const imposto = (subtotal + frete) * ALIQUOTA_IMPOSTO;
  const total = subtotal + frete + imposto;

  recFrete.textContent = formatarMoeda(frete);
  recImposto.textContent = formatarMoeda(imposto);
  recTotal.textContent = formatarMoeda(total);

  codigoTexto.textContent = 'PRONTO PARA CONFIRMAR';
  reciboNota.textContent = `Transportadora selecionada: ${freteSelecionado.nome}. Prazo estimado de ${freteSelecionado.prazo} dia(s) útil(eis) após a confirmação.`;
}

function resetarRecibo() {
  recFrete.textContent = '—';
  recImposto.textContent = '—';
  recTotal.textContent = '—';
  codigoTexto.textContent = 'AGUARDANDO CÁLCULO';
  reciboNota.textContent = 'Prazo estimado e código de rastreio aparecem aqui após escolher a transportadora.';
  seloConfirmado.hidden = true;
  seloConfirmado.classList.remove('mostrar');
  btnFinalizar.disabled = true;
  freteSelecionado = null;
}

/* ============================================================
   FINALIZAR ENVIO
   ============================================================ */
function gerarCodigoRastreio(cep) {
  const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NW${cep}${aleatorio}`;
}

function calcularDataEntrega(diasUteis) {
  const data = new Date();
  let restante = diasUteis;
  while (restante > 0) {
    data.setDate(data.getDate() + 1);
    const diaSemana = data.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) restante--;
  }
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

btnFinalizar.addEventListener('click', () => {
  if (!freteSelecionado) return;

  const cep = cepInput.value.replace(/\D/g, '');
  const codigo = gerarCodigoRastreio(cep);
  const dataEntrega = calcularDataEntrega(freteSelecionado.prazo);

  codigoTexto.textContent = codigo;
  seloConfirmado.hidden = false;
  requestAnimationFrame(() => seloConfirmado.classList.add('mostrar'));

  reciboNota.textContent = `Envio confirmado! Código de rastreio ${codigo} · previsão de entrega em ${dataEntrega}.`;

  btnFinalizar.disabled = true;
  btnFinalizar.textContent = 'Envio confirmado ✓';
  cepInput.disabled = true;
  document.querySelectorAll('.frete-opcao input').forEach(el => el.disabled = true);
});
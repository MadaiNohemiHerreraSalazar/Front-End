const cepInput = document.getElementById('cep');
const cepError = document.getElementById('cep-error');

// Máscara automática para o CEP (XXXXX-XXX)
cepInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  }
  e.target.value = value;
});

// Evento disparado quando o usuário sai do campo CEP
cepInput.addEventListener('blur', () => {
  const cepValue = cepInput.value.replace(/\D/g, '');
  
  // Validação do formato (deve conter exatamente 8 números)
  if (cepValue.length === 8) {
    cepError.style.display = 'none';
    buscarCep(cepValue);
  } else if (cepValue.length > 0) {
    cepError.textContent = 'CEP inválido. Deve conter 8 dígitos.';
    cepError.style.display = 'block';
    limparFormulario();
  }
});

async function buscarCep(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      cepError.textContent = 'CEP não encontrado.';
      cepError.style.display = 'block';
      limparFormulario();
      return;
    }

    // Preenchimento dos campos
    document.getElementById('logradouro').value = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('localidade').value = data.localidade || '';
    document.getElementById('uf').value = data.uf || '';
    
    // Foco automático para o número após carregar o CEP
    document.getElementById('numero').focus();

  } catch (error) {
    cepError.textContent = 'Erro ao consultar o CEP.';
    cepError.style.display = 'block';
  }
}

function limparFormulario() {
  document.getElementById('logradouro').value = '';
  document.getElementById('bairro').value = '';
  document.getElementById('localidade').value = '';
  document.getElementById('uf').value = '';
}
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ambiente SANDBOX (testes) da SuperFrete
const SUPERFRETE_URL = 'https://sandbox.superfrete.com/api/v0/calculator';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ============================================================
   NORMALIZAÇÃO DA RESPOSTA
   ------------------------------------------------------------
   A SuperFrete devolve um array de opções de frete, mas nomes
   de campo podem variar levemente entre versões da API. Essa
   função converte a resposta bruta para o formato exato que o
   front-end (public/script.js) já espera:
     { price, delivery_time, company: { name }, name, error }
   ============================================================ */
function normalizarOpcoes(dados) {
  if (!Array.isArray(dados)) return [];

  return dados.map((op) => ({
    name: op.name || op.service || 'Serviço',
    price: op.price ?? op.custom_price ?? op.total ?? null,
    delivery_time: op.delivery_time ?? op.custom_delivery_time ?? op.deadline ?? null,
    company: { name: (op.company && op.company.name) || op.carrier || 'Transportadora' },
    error: op.error || null
  }));
}

app.post('/api/frete', async (req, res) => {
  const {
    cepOrigem,
    cepDestino,
    peso,
    altura,
    largura,
    comprimento,
    valorSegurado
  } = req.body;

  if (!cepDestino || String(cepDestino).length !== 8) {
    return res.status(400).json({ mensagem: 'CEP de destino inválido.' });
  }

  const token = process.env.SUPERFRETE_TOKEN;
  if (!token) {
    return res.status(500).json({
      mensagem: 'Token da SuperFrete não configurado no servidor (.env).'
    });
  }

  const payload = {
    from: { postal_code: cepOrigem },
    to: { postal_code: cepDestino },
    package: {
      height: altura,
      width: largura,
      length: comprimento,
      weight: peso
    },
    options: {
      insurance_value: valorSegurado,
      receipt: false,
      own_hand: false
    }
  };

  try {
    const resposta = await fetch(SUPERFRETE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': process.env.SUPERFRETE_USER_AGENT || 'Trabalho Faculdade (contato@example.com)'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    // Log de depuração: útil na primeira execução para conferir os
    // nomes de campo reais devolvidos pela API antes de confiar 100%
    // na normalização acima.
    console.log('Resposta bruta da SuperFrete:', JSON.stringify(dados, null, 2));

    if (!resposta.ok) {
      return res.status(resposta.status).json({
        mensagem: 'Erro retornado pela API da SuperFrete.',
        detalhes: dados
      });
    }

    res.json(normalizarOpcoes(dados));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao consultar a API da SuperFrete.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

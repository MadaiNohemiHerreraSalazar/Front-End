require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ambiente SANDBOX (testes) do Melhor Envio
const MELHOR_ENVIO_URL = 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

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

  if (!cepDestino || cepDestino.length !== 8) {
    return res.status(400).json({ mensagem: 'CEP de destino inválido.' });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    return res.status(500).json({
      mensagem: 'Token do Melhor Envio não configurado no servidor (.env).'
    });
  }

  const payload = {
    from: { postal_code: cepOrigem },
    to: { postal_code: cepDestino },
    volumes: [
      {
        height: altura,
        width: largura,
        length: comprimento,
        weight: peso,
        insurance_value: valorSegurado
      }
    ],
    options: {
      receipt: false,
      own_hand: false
    }
  };

  try {
    const resposta = await fetch(MELHOR_ENVIO_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT || 'Trabalho Faculdade (contato@example.com)'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({
        mensagem: 'Erro retornado pela API do Melhor Envio.',
        detalhes: dados
      });
    }

    res.json(dados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao consultar a API do Melhor Envio.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
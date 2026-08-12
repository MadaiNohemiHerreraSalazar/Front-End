# Finalizar Envio — integrado com a API da SuperFrete (Sandbox)

## Por que SuperFrete e não Melhor Envio
Mesmo segmento (cálculo de frete via Correios/transportadoras), mas
empresa diferente, com um fluxo de cadastro no sandbox mais simples
(só email + confirmação por código, sem as travas que você teve no
Melhor Envio). A arquitetura do projeto é a mesma: o token fica só no
backend (`server/index.js`), nunca é exposto no navegador.

## Passo a passo do cadastro (uma vez só)

1. Acesse **https://sandbox.superfrete.com/#/integrations**
2. Crie a conta de teste (email + código de confirmação recebido).
3. Dentro do painel de integrações, gere o **token do ambiente Sandbox**.
4. Copie esse token.

## Configurando o projeto

```bash
npm install
cp .env.example .env
```

Abra o `.env` e cole o token:
```
SUPERFRETE_TOKEN=seu_token_aqui
SUPERFRETE_USER_AGENT=Trabalho Faculdade (seu-email-real@exemplo.com)
```

> O `User-Agent` é obrigatório pela API — coloque um email de contato
> válido, mesmo que seja o seu email de estudante.

## Rodando

```bash
npm start
```
Abra **http://localhost:3000**, digite um CEP e o frete é calculado
via SuperFrete Sandbox.

## Importante: confira a resposta real na primeira execução

APIs de frete às vezes mudam levemente os nomes dos campos entre
versões. O `server/index.js` já imprime no terminal a resposta bruta
da SuperFrete (`console.log('Resposta bruta da SuperFrete: ...')`) e
depois normaliza para o formato que o front-end espera
(`price`, `delivery_time`, `company.name`, `name`, `error`).

Na primeira vez que testar:
1. Rode o projeto e calcule um frete.
2. Olhe o terminal onde rodou `npm start` — verá o JSON bruto que a
   SuperFrete devolveu.
3. Se algum campo vier com nome diferente do esperado (por exemplo,
   `total` no lugar de `price`), ajuste a função `normalizarOpcoes`
   em `server/index.js` — ela já tenta várias variações comuns, mas
   vale conferir.

## Se o cadastro na SuperFrete também travar

Se por qualquer motivo o cadastro no sandbox da SuperFrete também não
funcionar, me avise — dá pra tentar a API dos Correios
(portal Correios Desenvolvedores) como segunda alternativa, o cadastro
lá é diferente (via idCorreios) e pode funcionar mesmo se o das duas
plataformas de frete falhar.

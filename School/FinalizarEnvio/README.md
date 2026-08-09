# Finalizar Envio — NeoWave

Página de finalização de envio: o usuário informa **apenas o CEP de destino**
e o sistema calcula automaticamente:

1. **Endereço** — via API pública do ViaCEP (chamada direta do navegador).
2. **Frete** — via API do Melhor Envio (ambiente **sandbox**), calculado no
   backend para não expor o token no navegador.
3. **Imposto estimado** (7%, simulado) e **total** do pedido.

Ao final, o botão "Finalizar envio" gera um código de rastreio e mostra um
selo de confirmação no recibo.

## Estrutura
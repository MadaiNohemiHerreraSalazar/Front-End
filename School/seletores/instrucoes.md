🎯 Desafios de Estilização

Siga as instruções abaixo para construir seu conjunto de regras CSS. Cada item foca em um conceito fundamental de seleção.
1. Estilização Global (Seletor de Tag)

Aplique uma base visual para todo o documento. O seletor de tag afeta todos os elementos do tipo especificado na página.

    Alvo: body

    Propriedades: * background-color: #f4f4f4;

        font-family: Arial, sans-serif;

2. Identificação Única (Seletor de ID)

Utilize o ID para estilizar um elemento que ocorre apenas uma vez na página. IDs possuem alta especificidade.

    Alvo: #topo-principal

    Propriedades: * Fundo escuro (#333), texto branco e padding de 20px.

3. Padrões Repetíveis (Seletor de Classe)

Classes são ideais para componentes que se repetem, como cartões de conteúdo.

    Alvo: .card

    Propriedades: * background-color: white;

        border-radius: 10px;

        width: 200px;

4. Relação de Hierarquia (Seletor Descendente)

Estilize elementos com base na sua posição dentro de outros elementos.

    Alvo: p span (todos os spans dentro de parágrafos)

    Propriedades: * font-weight: bold;

        color: blue;

5. Otimização de Código (Seletor de Agrupamento)

Aplique o mesmo estilo a múltiplos seletores simultaneamente para evitar repetição de código.

    Alvo: h1, h2

    Propriedades: * color: #2c3e50;

6. Especialização (Seletor de Classe Específica)

Aprenda a diferenciar um elemento que possui múltiplas classes.

    Alvo: .card.destaque

    Propriedades: * border: 3px solid gold;

        transform: scale(1.05);

7. Estados do Usuário (Pseudo-classe :hover)

Adicione interatividade baseada na ação do ponteiro do mouse.

    Alvo: button:hover

    Propriedades: * background-color: #27ae60;

        cursor: pointer;

8. Seleção Estrutural (Pseudo-classe :nth-child)

Selecione um elemento com base em sua posição exata na lista de irmãos.

    Alvo: nav ul li:nth-child(2)

    Propriedades: * text-transform: uppercase;
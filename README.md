# Editor de Texto Jurídico com Suporte a Variáveis

Este é um componente Rich Text Editor estendido para [weweb.io](https://www.weweb.io/) que adiciona suporte para variáveis no formato `{{nome_variavel}}`.

## Funcionalidades

- Editor de texto rico com todas as funcionalidades padrão (negrito, itálico, listas, tabelas, etc.)
- Suporte para marcação e detecção automática de variáveis no formato `{{exemplo}}`
- Normalização automática de nomes de variáveis (remoção de acentos, espaços substituídos por traços)
- Estilização personalizada para variáveis
- Exportação das variáveis encontradas no texto para uso em outros componentes

## Instalação

Para executar localmente, primeiro instale todas as dependências com:

```bash
npm install
```

## Iniciar o servidor de desenvolvimento

Para servir localmente, execute:

```bash
npm run serve
```

ou especifique uma porta:

```bash
npm run serve -- port=4040
```

Em seguida, acesse o editor WeWeb, abra o popup de desenvolvedor e adicione seu elemento personalizado.

## Uso das variáveis

1. Selecione um texto no editor
2. Clique no botão de variável na barra de ferramentas (ícone de código) para transformar o texto em uma variável
3. O texto será automaticamente formatado como `{{texto}}` e estilizado
4. As variáveis também são detectadas automaticamente ao digitar no formato `{{exemplo}}`

## Exportação de variáveis

O componente exporta um array de variáveis encontradas no texto, acessível através da propriedade `variables` do componente. Cada variável contém:

- `id`: Identificador único
- `tipo`: Tipo da variável (padrão: "text")
- `value`: Valor da variável (null por padrão)
- `required`: Flag se a variável é obrigatória (false por padrão)
- `variavel`: Nome da variável no formato `{{nome_variavel}}`
- `inputNome`: Nome de entrada (null por padrão)
- `repetido`: Número de ocorrências da variável no texto

## Personalização

As variáveis podem ser estilizadas através das propriedades do componente, incluindo:

- Tamanho da fonte
- Família da fonte
- Peso da fonte
- Cor do texto
- Cor de fundo
- Tamanho da borda
- Cor da borda
- Raio da borda
- Preenchimento (padding)

## Build

Antes do lançamento, você pode verificar erros de compilação executando:

```bash
npm run build --name=editor-texto-jurispro
```

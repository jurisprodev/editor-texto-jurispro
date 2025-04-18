# Editor de Texto Jurídico com Suporte a Variáveis e Indentação

Este é um componente Rich Text Editor estendido para [weweb.io](https://www.weweb.io/) que adiciona suporte para variáveis no formato `{{nome_variavel}}` e recursos avançados de indentação.

## Funcionalidades

- Editor de texto rico com todas as funcionalidades padrão (negrito, itálico, listas, tabelas, etc.)
- Suporte para marcação e detecção automática de variáveis no formato `{{exemplo}}`
- Normalização automática de nomes de variáveis (remoção de acentos, espaços substituídos por traços)
- Sistema avançado de indentação de parágrafos com até 16 níveis
- Atalhos de teclado (Tab e Shift+Tab) para aplicar indentação
- Estilização personalizada para variáveis
- Exportação das variáveis encontradas no texto para uso em outros componentes
- Limpeza automática de formatações indesejadas ao colar conteúdo externo (remove spans, atributos de estilo)

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

## Uso da indentação

O editor oferece duas formas de aplicar indentação:

1. **Botões na barra de ferramentas:**
   - Clique no botão de recuo (indent) para aumentar o nível de indentação
   - Clique no botão de remoção de recuo (outdent) para diminuir o nível de indentação

2. **Atalhos de teclado:**
   - Pressione `Tab` para aumentar o nível de indentação
   - Pressione `Shift+Tab` para diminuir o nível de indentação

O editor suporta até 16 níveis de indentação, e cada nível adiciona um recuo de 40px.

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

### Variáveis

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

### Indentação

A indentação pode ser personalizada através das seguintes propriedades:

- Visibilidade dos botões de indentação na barra de ferramentas
- Tamanho do recuo para cada nível (padrão: 40px)
- Número máximo de níveis de indentação (padrão: 16)

## Ações disponíveis

O componente disponibiliza várias ações que podem ser utilizadas em fluxos de trabalho:

- Todas as ações padrão de formatação (negrito, itálico, etc.)
- `indent`: Aumenta o nível de indentação do texto selecionado
- `outdent`: Diminui o nível de indentação do texto selecionado

## Build

Antes do lançamento, você pode verificar erros de compilação executando:

```bash
npm run build --name=editor-texto-jurispro
```

## Atualização do repositório

Para atualizar este repositório após fazer alterações, utilize os seguintes comandos:

```bash
git add .
git commit -m "Descrição das alterações"
git push origin master
```

## Limpeza ao colar conteúdo

O editor inclui um sistema inteligente para tratar conteúdo colado de fontes externas (como Word, Google Docs, etc.):

1. **Três modos de limpeza:**
   - `plainText`: Remove toda formatação, mantendo apenas o texto puro
   - `cleanHtml`: Remove elementos indesejados (span, var, font) e atributos de estilo, preservando formatações básicas (negrito, itálico, etc.)
   - `smartClean`: Preserva elementos semânticos importantes e alinhamento de texto, removendo formatações desnecessárias

2. **Preservação inteligente:**
   - Alinhamento de texto é preservado (justificado, centralizado, etc.)
   - Formatações semânticas (links, negrito, itálico) são mantidas onde apropriado
   - Tags problemáticas como `<span>` são completamente removidas

Esta funcionalidade evita que estilos externos indesejados contaminem o documento, mantendo a consistência visual do texto.

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * ClipboardTextSerializer - Extensão para o TipTap que limpa formatação ao colar conteúdo
 * 
 * Esta extensão impede que tags span e estilos inline sejam introduzidos no editor
 * quando o usuário cola conteúdo de fontes externas como Google Docs, Word, etc.
 * 
 * Ela oferece três modos de operação:
 * - plainText: converte todo conteúdo colado para texto puro sem formatação
 * - cleanHtml: remove spans e atributos de estilo, mas mantém formatação básica
 * - smartClean: tenta preservar formatações semânticas importantes e remove o resto
 */
export const ClipboardTextSerializer = Extension.create({
  name: 'clipboardTextSerializer',
  
  addOptions() {
    return {
      // Modo de limpeza: 'plainText', 'cleanHtml', ou 'smartClean'
      mode: 'cleanHtml',
    }
  },
  
  addProseMirrorPlugins() {
    const mode = this.options.mode;
    const editor = this.editor;
    
    // Definir a função de limpeza localmente em vez de usar o método da extensão
    const cleanHtml = (element, smartMode) => {
      // Elementos a preservar mesmo no modo de limpeza
      const safeElements = ['A', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'CODE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI'];
      
      // Elementos que devem ser explicitamente removidos
      const removeElements = ['SPAN', 'VAR', 'FONT'];
      
      // Atributos a preservar para manter alinhamento e formatação importante
      const safeAttributes = ['align', 'href', 'target'];
      
      // Função para verificar se um elemento de formatação deve ser dividido
      // (por exemplo, quando um STRONG contém vários parágrafos)
      const shouldBreakFormatting = (node) => {
        if (['STRONG', 'B', 'EM', 'I', 'U', 'S', 'SPAN', 'VAR', 'FONT'].includes(node.tagName)) {
          // Se for SPAN ou VAR, sempre processar
          if (['SPAN', 'VAR', 'FONT'].includes(node.tagName)) {
            return true;
          }
          
          // Para outros elementos formatadores, verificar critérios
          return node.querySelector('p, div, br, h1, h2, h3, h4, h5, h6') !== null ||
                 node.textContent.split('\n').length > 2 || 
                 node.innerHTML.includes('<br') ||
                 node.textContent.length > 300;
        }
        return false;
      };
      
      // Cria uma função recursiva dentro do escopo
      const processNode = (node, smart) => {
        // Verificar e processar o nó atual antes de continuar
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Remover qualquer atributo de cor e outros estilos não permitidos
          if (node.style) {
            const textAlign = node.style.textAlign;
            // Apagar todos os estilos, mas preservar textAlign se existir
            node.removeAttribute('style');
            if (textAlign) {
              node.style.textAlign = textAlign;
            }
          }
          
          // Remover atributos de classe
          node.removeAttribute('class');
          node.removeAttribute('color');
        }
        
        if (node.nodeType === Node.ELEMENT_NODE && shouldBreakFormatting(node)) {
          // Se for um elemento formatador que precisa ser quebrado, extrair o conteúdo
          const tagName = node.tagName;
          const fragment = document.createDocumentFragment();
          
          // Verificar se é um SPAN ou VAR com alinhamento
          if (removeElements.includes(tagName)) {
            const style = node.getAttribute('style');
            let textAlign = null;
            
            // Extrair alinhamento de texto do estilo, se existir
            if (style && style.includes('text-align')) {
              const match = style.match(/text-align:\s*([^;]+)/i);
              if (match && match[1]) {
                textAlign = match[1].trim();
              }
            }
            
            // Se tiver alinhamento, criar um parágrafo para preservá-lo
            if (textAlign) {
              const p = document.createElement('p');
              p.style.textAlign = textAlign;
              
              // Copiar todo o conteúdo para o parágrafo
              while (node.firstChild) {
                p.appendChild(node.firstChild);
              }
              
              fragment.appendChild(p);
            } else {
              // Caso contrário, apenas move os filhos para o fragmento
              while (node.firstChild) {
                fragment.appendChild(node.firstChild);
              }
            }
          } 
          // Para outros elementos formatadores (B, STRONG, etc.)
          else {
            // Para cada nó filho, decidir se mantém a formatação ou não
            Array.from(node.childNodes).forEach(child => {
              // Se for texto simples ou elemento que não cria quebra, manter a formatação
              if (child.nodeType === Node.TEXT_NODE || 
                  (child.nodeType === Node.ELEMENT_NODE && 
                   !['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(child.tagName))) {
                
                // Manter a formatação para este texto/elemento
                const newFormat = document.createElement(tagName);
                newFormat.appendChild(child.cloneNode(true));
                fragment.appendChild(newFormat);
              } else {
                // Para elementos estruturais, não aplicar a formatação do pai
                fragment.appendChild(child.cloneNode(true));
              }
            });
          }
          
          // Substituir o nó original pelo fragmento
          node.parentNode.replaceChild(fragment, node);
          
          // Processar o fragmento novamente
          Array.from(fragment.childNodes).forEach(child => {
            processNode(child, smart);
          });
          
          return; // Já processamos este nó e seus filhos
        }
        
        // Processamento normal dos nós filho
        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            // Limpar diretamente um span ou var antes de processá-los
            if (removeElements.includes(child.tagName)) {
              const fragment = document.createDocumentFragment();
              while (child.firstChild) {
                fragment.appendChild(child.firstChild);
              }
              child.parentNode.replaceChild(fragment, child);
              
              // Processar os nós que acabamos de extrair
              Array.from(fragment.childNodes).forEach(newChild => {
                processNode(newChild, smart);
              });
              
              // Em vez de continue, usamos return para sair desta iteração do forEach
              return;
            }
            
            // Para outros elementos, limpar seletivamente atributos de estilo
            const style = child.getAttribute('style');
            
            // Remove todos os atributos de estilo
            const styleBackup = style;
            child.removeAttribute('style');
            child.removeAttribute('class');
            child.removeAttribute('color');
            
            // Restaura apenas atributos de alinhamento se existirem
            if (styleBackup && styleBackup.includes('text-align')) {
              const match = styleBackup.match(/text-align:\s*([^;]+)/i);
              if (match && match[1]) {
                child.style.textAlign = match[1].trim();
              }
            }
            
            // Preserva atributos seguros
            safeAttributes.forEach(attr => {
              const value = child.getAttribute(attr);
              if (value) {
                child.setAttribute(attr, value);
              }
            });
            
            // No modo inteligente, preserva apenas elementos seguros e converte o resto para parágrafos
            if (smart && !safeElements.includes(child.tagName)) {
              if (child.tagName !== 'P' && child.tagName !== 'DIV') {
                // Converte elementos desconhecidos em parágrafos
                const p = document.createElement('p');
                
                // Transfere alinhamento se existir
                if (child.style && child.style.textAlign) {
                  p.style.textAlign = child.style.textAlign;
                }
                
                while (child.firstChild) {
                  p.appendChild(child.firstChild);
                }
                child.parentNode.replaceChild(p, child);
              }
            }
            
            // Processa filhos recursivamente usando a função local
            processNode(child, smart);
          }
        });
      };
      
      // Inicia o processamento com o elemento raiz
      processNode(element, smartMode);
    };
    
    return [
      new Plugin({
        key: new PluginKey('clipboard-text-serializer'),
        props: {
          handlePaste: (view, event) => {
            try {
              if (mode === 'plainText') {
                // Modo de texto puro - remove toda formatação
                event.preventDefault()
                const text = event.clipboardData.getData('text/plain')
                
                if (text) {
                  const { tr } = view.state
                  view.dispatch(tr.insertText(text))
                }
                
                return true
              } 
              else if (mode === 'cleanHtml' || mode === 'smartClean') {
                // Modos de limpeza HTML - remove spans e estilos, mas mantém estrutura básica
                const html = event.clipboardData.getData('text/html')
                
                if (html) {
                  event.preventDefault()
                  
                  // Criar um elemento temporário para manipular o HTML
                  const tempDiv = document.createElement('div')
                  tempDiv.innerHTML = html
                  
                  // Remover spans e atributos de estilo
                  cleanHtml(tempDiv, mode === 'smartClean')
                  
                  // Verificação adicional para garantir que nenhum span permaneça
                  const spansRemanescentes = tempDiv.querySelectorAll('span, var, font');
                  if (spansRemanescentes && spansRemanescentes.length) {
                    Array.from(spansRemanescentes).forEach(span => {
                      // Criar um fragmento para o conteúdo do span
                      const fragment = document.createDocumentFragment();
                      
                      // Mover todos os filhos para o fragmento
                      while (span.firstChild) {
                        fragment.appendChild(span.firstChild);
                      }
                      
                      // Substituir o span pelo fragmento
                      if (span.parentNode) {
                        span.parentNode.replaceChild(fragment, span);
                      }
                    });
                  }
                  
                  // Converter o HTML limpo de volta para texto para inserção simples
                  const cleanedHtml = tempDiv.innerHTML
                  
                  // Inserir o HTML através do comando pasteHTML do editor
                  if (editor && editor.commands && editor.commands.insertContent) {
                    editor.commands.insertContent(cleanedHtml)
                    return true
                  }
                  
                  // Fallback: se o comando insertContent não estiver disponível
                  // Tenta usar a API do ProseMirror diretamente
                  try {
                    const { tr } = view.state
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(cleanedHtml, 'text/html')
                    view.dispatch(tr.insertText(doc.body.textContent || cleanedHtml))
                    return true
                  } catch (innerError) {
                    console.error('Fallback paste failed:', innerError)
                    // Deixar o comportamento padrão como último recurso
                    return false
                  }
                }
              }
              
              // Deixa o editor processar normalmente se nenhuma condição acima for atendida
              return false
            } catch (error) {
              console.error('Error in clipboard handler:', error)
              return false // Permitir comportamento padrão em caso de erro
            }
          },
        },
      }),
    ]
  },
}) 
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * ClipboardTextSerializer - Extensão aprimorada para limpar formatação ao colar
 * 
 * Versão melhorada com tratamento de erros e debug para identificar problemas
 */
export const ClipboardTextSerializer = Extension.create({
  name: 'clipboardTextSerializer',
  
  addOptions() {
    return {
      // Modo de limpeza: 'plainText', 'cleanHtml', ou 'smartClean'
      mode: 'cleanHtml',
      // Adicionar opção de debug para ajudar a identificar problemas
      debug: false
    }
  },
  
  addProseMirrorPlugins() {
    const mode = this.options.mode;
    const debug = this.options.debug;
    const editor = this.editor;
    
    // Função de log para debug
    const logDebug = (...args) => {
      if (debug) {
        console.log('[ClipboardTextSerializer]', ...args);
      }
    };
    
    // Função para limpar HTML com tratamento de erros
    const cleanHtml = (element, smartMode) => {
      try {
        // Elementos a preservar mesmo no modo de limpeza
        const safeElements = ['A', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'CODE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI'];
        
        // Elementos que devem ser explicitamente removidos
        const removeElements = ['SPAN', 'VAR', 'FONT'];
        
        // Atributos a preservar para manter alinhamento e formatação importante
        const safeAttributes = ['align', 'href', 'target'];
        
        // Função para verificar se um elemento de formatação deve ser dividido
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
          // Verificação de segurança contra nós nulos
          if (!node) return;
          
          // Pular processamento de nós de texto
          if (node.nodeType === Node.TEXT_NODE) {
            return;
          }
          
          // Verificar e processar o nó atual antes de continuar
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Antes de remover estilos, verificar se o elemento tem texto mas nenhum filho elemento
            const apenasTexto = Array.from(node.childNodes).every(child => child.nodeType === Node.TEXT_NODE);
            const conteudoTexto = node.textContent.trim();
            
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
            
            // Verificar se é um elemento vazio após a limpeza
            if (apenasTexto && conteudoTexto && !node.textContent.trim()) {
              // O conteúdo de texto foi perdido, restaurar
              node.textContent = conteudoTexto;
            }
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
            
            // Verificação de segurança para parentNode
            if (node.parentNode) {
              // Substituir o nó original pelo fragmento
              node.parentNode.replaceChild(fragment, node);
              
              // Processar o fragmento novamente
              Array.from(fragment.childNodes).forEach(child => {
                processNode(child, smart);
              });
            }
            
            return; // Já processamos este nó e seus filhos
          }
          
          // Processamento normal dos nós filho (com segurança adicional)
          if (node.childNodes) {
            // Obter cópia do array de nós filhos para evitar problemas com remoção durante a iteração
            const childNodes = Array.from(node.childNodes);
            
            childNodes.forEach(child => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                // Limpar diretamente um span ou var antes de processá-los
                if (removeElements.includes(child.tagName)) {
                  const fragment = document.createDocumentFragment();
                  while (child.firstChild) {
                    fragment.appendChild(child.firstChild);
                  }
                  
                  // Verificação de segurança para parentNode
                  if (child.parentNode) {
                    child.parentNode.replaceChild(fragment, child);
                    
                    // Processar os nós que acabamos de extrair
                    Array.from(fragment.childNodes).forEach(newChild => {
                      processNode(newChild, smart);
                    });
                  }
                  
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
                    
                    // Verificação de segurança para parentNode
                    if (child.parentNode) {
                      child.parentNode.replaceChild(p, child);
                      
                      // Atualiza a referência para processamento
                      processNode(p, smart);
                      return; // Sair desta iteração, pois o nó foi substituído
                    }
                  }
                }
                
                // Processa filhos recursivamente usando a função local
                processNode(child, smart);
              }
            });
          }
        };
        
        // Inicia o processamento com o elemento raiz
        processNode(element, smartMode);
        
        // Verificação final para eliminar quaisquer spans remanescentes
        // Isso garante que mesmo que o processamento acima falhe, os spans serão removidos
        const spans = element.querySelectorAll('span, var, font');
        spans.forEach(span => {
          const parent = span.parentNode;
          if (parent) {
            // Cria um fragmento para o conteúdo
            const fragment = document.createDocumentFragment();
            
            // Move todo o conteúdo para o fragmento
            while (span.firstChild) {
              fragment.appendChild(span.firstChild);
            }
            
            // Substitui o span pelo fragmento
            parent.replaceChild(fragment, span);
          }
        });
        
      } catch (error) {
        console.error('[ClipboardTextSerializer] Error cleaning HTML:', error);
        // Em caso de erro, retorna o elemento original sem alterações
        return element;
      }
    };
    
    return [
      new Plugin({
        key: new PluginKey('clipboard-text-serializer'),
        props: {
          handlePaste: (view, event) => {
            try {
              if (mode === 'plainText') {
                // Modo de texto puro - remove toda formatação
                event.preventDefault();
                const text = event.clipboardData.getData('text/plain');
                
                logDebug('Paste as plain text:', text?.substring(0, 50) + (text?.length > 50 ? '...' : ''));
                
                if (text) {
                  const { tr } = view.state;
                  view.dispatch(tr.insertText(text));
                }
                
                return true;
              } 
              else if (mode === 'cleanHtml' || mode === 'smartClean') {
                // Modos de limpeza HTML - remove spans e estilos, mas mantém estrutura básica
                const html = event.clipboardData.getData('text/html');
                const plainText = event.clipboardData.getData('text/plain');
                
                logDebug('Paste mode:', mode);
                logDebug('HTML available:', !!html);
                logDebug('Plain text available:', !!plainText);
                
                // Salvar o texto puro para usar como fallback se necessário
                let textFallback = plainText.trim();
                
                if (html) {
                  event.preventDefault();
                  
                  // Criar um elemento temporário para manipular o HTML
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = html;
                  
                  logDebug('Original HTML content:', tempDiv.innerHTML.substring(0, 100) + (tempDiv.innerHTML.length > 100 ? '...' : ''));
                  
                  // Salvamos o conteúdo de texto original antes da limpeza
                  const originalText = tempDiv.textContent.trim();
                  
                  // Remover spans e atributos de estilo
                  cleanHtml(tempDiv, mode === 'smartClean');
                  
                  logDebug('Cleaned HTML content:', tempDiv.innerHTML.substring(0, 100) + (tempDiv.innerHTML.length > 100 ? '...' : ''));
                  
                  // Verificação adicional para garantir que nenhum span permaneça
                  const spansRemanescentes = tempDiv.querySelectorAll('span, var, font');
                  spansRemanescentes.forEach(span => {
                    // Criar um fragmento para o conteúdo do span
                    const fragment = document.createDocumentFragment();
                    
                    // Mover todos os filhos para o fragmento
                    while (span.firstChild) {
                      fragment.appendChild(span.firstChild);
                    }
                    
                    // Substituir o span pelo fragmento
                    span.parentNode.replaceChild(fragment, span);
                  });
                  
                  // Verificar se o conteúdo resultante não está vazio
                  if (!tempDiv.textContent.trim()) {
                    logDebug('Content empty after cleaning, using plain text fallback');
                    // Se estiver vazio após a limpeza, usar o texto puro
                    if (textFallback) {
                      editor.commands.insertContent(textFallback);
                      return true;
                    }
                  }
                  
                  // Verificar se existe conteúdo significativo
                  if (tempDiv.innerHTML === '<p></p>' || tempDiv.innerHTML === '') {
                    logDebug('Content insignificant after cleaning, using plain text fallback');
                    // Se o conteúdo for apenas um parágrafo vazio ou nada, usar o texto puro
                    if (textFallback) {
                      editor.commands.insertContent(textFallback);
                      return true;
                    }
                  }
                  
                  // Converter o HTML limpo de volta para texto para inserção
                  const cleanedHtml = tempDiv.innerHTML;
                  
                  // Verificar se o texto foi preservado após a limpeza
                  const cleanedText = tempDiv.textContent.trim();
                  
                  // Se o texto foi perdido durante a limpeza, usar o texto original
                  if (!cleanedText && originalText) {
                    logDebug('Text lost during cleaning, using original text');
                    editor.commands.insertContent(originalText);
                    return true;
                  }
                  
                  // Inserir o HTML através do comando pasteHTML do editor
                  logDebug('Inserting cleaned HTML content');
                  editor.commands.insertContent(cleanedHtml);
                  
                  return true;
                } else if (textFallback) {
                  logDebug('No HTML available, using plain text');
                  // Se não houver HTML mas tiver texto puro, inserir o texto
                  event.preventDefault();
                  editor.commands.insertContent(textFallback);
                  return true;
                }
              }
              
              // Deixa o editor processar normalmente se nenhuma condição acima for atendida
              logDebug('No special handling, letting editor handle normally');
              return false;
            } catch (error) {
              console.error('[ClipboardTextSerializer] Error handling paste:', error);
              // Em caso de erro no processamento, cair para o comportamento padrão
              return false;
            }
          },
        },
      }),
    ];
  },
})
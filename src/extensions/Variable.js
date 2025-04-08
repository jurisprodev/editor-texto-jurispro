import { Mark } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const Variable = Mark.create({
  name: 'variable',
  
  priority: 1000,
  
  inclusive: false,
  
  addOptions() {
    return {
      HTMLAttributes: {},
      autoDetect: true, // Permite desabilitar a detecção automática se necessário
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'var',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['var', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0]
  },
  
  addCommands() {
    return {
      setVariable: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleVariable: attributes => ({ commands, state }) => {
        if (this.editor.isActive(this.name)) {
          return commands.unsetMark(this.name)
        }
        return commands.toggleMark(this.name, attributes)
      },
      unsetVariable: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
  
  addProseMirrorPlugins() {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    return [
      new Plugin({
        key: new PluginKey('variableDetector'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!this.options.autoDetect) return null;
          
          if (!transactions.some(tr => tr.docChanged)) return null;
          
          const tr = newState.tr;
          let modified = false;
          
          newState.doc.descendants((node, pos) => {
            if (node.isText) {
              const text = node.text;
              let match;
              
              variableRegex.lastIndex = 0;
              
              while ((match = variableRegex.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                
                const marks = newState.doc.rangeHasMark(start, end, newState.schema.marks.variable);
                
                if (!marks) {
                  tr.addMark(start, end, newState.schema.marks.variable.create());
                  modified = true;
                }
              }
              
              if (node.marks.some(mark => mark.type.name === 'variable')) {
                if (!(/^\{\{.*\}\}$/.test(node.text))) {
                  tr.removeMark(pos, pos + node.text.length, newState.schema.marks.variable);
                  modified = true;
                }
              }
            }
          });
          
          return modified ? tr : null;
        },
      }),
    ]
  },
}) 
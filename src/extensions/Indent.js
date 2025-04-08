import { Extension } from '@tiptap/core'

export const Indent = Extension.create({
  name: 'indent',
  
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem'],
      defaultIndentLevel: 0,
      minIndentLevel: 0,
      maxIndentLevel: 16,
      indentUnit: 'px',
      indentSize: 40,
    }
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indentLevel: {
            default: this.options.defaultIndentLevel,
            renderHTML: attributes => {
              if (attributes.indentLevel) {
                const value = this.options.indentSize * attributes.indentLevel
                const unit = this.options.indentUnit
                return {
                  style: `padding-left: ${value}${unit};`
                }
              }
              return {}
            },
            parseHTML: element => {
              const style = element.getAttribute('style') || ''
              const paddingLeft = style.match(/padding-left:\s*(\d+)/)
              if (paddingLeft) {
                const value = parseInt(paddingLeft[1], 10)
                const indentLevel = Math.round(value / this.options.indentSize)
                return Math.min(
                  Math.max(indentLevel, this.options.minIndentLevel),
                  this.options.maxIndentLevel
                )
              }
              return this.options.defaultIndentLevel
            },
          },
        },
      },
    ]
  },
  
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { ranges } = selection
        
        if (!dispatch) return true
        
        tr = tr.setStoredMarks([])
        
        ranges.forEach(range => {
          state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentLevel = node.attrs.indentLevel || 0
              if (currentLevel < this.options.maxIndentLevel) {
                tr = tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indentLevel: currentLevel + 1,
                })
              }
            }
            return true
          })
        })
        
        if (tr.docChanged) {
          dispatch(tr)
          return true
        }
        
        return false
      },
      
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { ranges } = selection
        
        if (!dispatch) return true
        
        tr = tr.setStoredMarks([])
        
        ranges.forEach(range => {
          state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentLevel = node.attrs.indentLevel || 0
              if (currentLevel > this.options.minIndentLevel) {
                tr = tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indentLevel: currentLevel - 1,
                })
              }
            }
            return true
          })
        })
        
        if (tr.docChanged) {
          dispatch(tr)
          return true
        }
        
        return false
      },
    }
  },
  
  addKeyboardShortcuts() {
    return {
      'Tab': () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    }
  },
}) 
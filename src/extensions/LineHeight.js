import { Extension } from '@tiptap/core'

export const LineHeight = Extension.create({
  name: 'lineHeight',
  
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote', 'listItem'],
      defaultLineHeight: 'normal',
      lineHeightOptions: ['normal', '1', '1.15', '1.5', '2', '2.5', '3']
    }
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (attributes.lineHeight && attributes.lineHeight !== 'normal') {
                return {
                  style: `line-height: ${attributes.lineHeight};`
                }
              }
              return {}
            },
            parseHTML: element => {
              const style = element.getAttribute('style') || ''
              const lineHeight = style.match(/line-height:\s*([^;]+)/)
              
              if (lineHeight) {
                return lineHeight[1].trim()
              }
              
              return this.options.defaultLineHeight
            },
          },
        },
      },
    ]
  },
  
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ tr, dispatch }) => {
        const { selection } = tr
        
        if (!dispatch) return true
        
        tr = tr.setStoredMarks([])
        
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              lineHeight,
            })
          }
          return true
        })
        
        return dispatch(tr)
      },
    }
  },
}) 
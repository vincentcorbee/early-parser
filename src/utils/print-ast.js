import append from './append'
import createNewElement from './create-new-element'

const visitor = {
  Program: {
    enter: ({ node, result, visitor, traverse }) => {
      return (
        result +
        `
      <ul>
        <li>
          <span>${node.type}</span>
          <ul>
            <li>
              <span>type</span>
              <span>${node.type}</span>
            </li>
            <li>
              <span>body</span>
              <ul>
                  ${node.body.map(child =>
                    traverse({ node: child, result, visitor, parent: node })
                  )}
              <ul>
            </li>
          </ul>
        </li>
      </ul>`
      )
    },
  },
  ThrowStatement: {
    enter: ({ node, result }) => {
      return (
        result +
        `
        <li>
          <span>${node.type}</span>
          <ul>
            <li>
              <span>type</span>
              <span>${node.type}</span>
            </li>
            <li>
              <span>argument</span>
              <span>${node.argument}</span>
            </li>
          </ul>
        </li>`
      )
    },
  },
}

const traverse = ({ node, visitor, parent, result = '' }) => {
  const actions = visitor[node.type]

  if (actions) {
    const { enter } = actions

    if (enter) {
      return enter({ node, parent, result, visitor, traverse })
    }
  }

  return result
}

export const printAST = (AST, target = document.body) => {
  const root = createNewElement('div', ['class=tree ast flex hcenter'])
  const docFrag = createNewElement('documentFragment')

  const createTree = node => {
    const docFrag = createNewElement('documentFragment')

    const { children } = node

    const el = createNewElement('div', ['class=node flex flexcolumn'])
    const value = children ? node.type : node.value

    console.log(value)

    if (value) append(el, createNewElement('span', ['class=name', `content=${value}`]))

    append(docFrag, el)

    if (children) {
      const childreEl = createNewElement('div', ['class=children flex'])

      children.forEach(child => {
        append(el, append(childreEl, createTree(child)))
      })
    }

    return docFrag
  }

  // target.innerHTML = traverse({ node: AST, visitor, result: '' })

  append(target, append(docFrag, append(root, createTree(AST))))
}

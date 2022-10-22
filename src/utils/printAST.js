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

  const createTree = tree => {
    const docFrag = createNewElement('documentFragment')

    tree.forEach(node => {
      const isList =
        Array.isArray(node) &&
        (node.length > 1 || (node.length === 1 && typeof node[0] === 'object'))
      const el = createNewElement('div', ['class=node flex flexcolumn'])
      const value = isList
        ? node.type
        : node
        ? node.type === 'undefined'
          ? 'undefined'
          : node[0] || node
        : node

      if (value) {
        append(el, createNewElement('span', ['class=name', `content=${value}`]))
      }

      append(docFrag, el)

      if (isList) {
        append(
          el,
          append(createNewElement('div', ['class=children flex']), createTree(node))
        )
      }
    })

    return docFrag
  }

  target.innerHTML = traverse({ node: AST, visitor, result: '' })

  // append(target, append(docFrag, append(root, createTree(AST))))
}

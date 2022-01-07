import { createNewElement, append } from '../helpers'

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

  append(target, append(docFrag, append(root, createTree(AST))))
}

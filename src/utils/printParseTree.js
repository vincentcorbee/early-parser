import { createNewElement, append, TOKENS } from '../helpers'

export const printParseTree = (parseTree, target = document.body) => {
  const docFrag = createNewElement('documentFragment')
  const root = createNewElement('div', ['class=tree flex hcenter'])

  const createTree = tree => {
    const docFrag = createNewElement('documentFragment')
    tree.forEach(node => {
      const el = createNewElement('div', [
        'class=node flex flexcolumn',
        `innerHTML=<span class='name'>${
          node.nodeType === TOKENS.TERMINAL ? node.value : node.type
        }</span>`,
      ])

      append(docFrag, el)

      if (node.children) {
        append(
          el,
          append(
            createNewElement('div', ['class=children flex']),
            createTree(node.children)
          )
        )
      }
    })
    return docFrag
  }
  append(target, append(docFrag, append(root, createTree(parseTree))))
}

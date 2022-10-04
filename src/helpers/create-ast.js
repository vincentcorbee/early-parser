import mapNode from "./map-node"

const createASTNode = (node, parentNode) => {
  const { action, value, type, children } = node

  // Perform sematic action on node
  if (typeof action === 'function') {
    let ASTNode

    if (children) {
      ASTNode = action({ type, children: children.flatMap(child => createASTNode(child, node)) }, parentNode)
    } else {
      ASTNode = action({ type, value }, parentNode)
    }

    if (ASTNode === null) {
      return []
    }

    return ASTNode

  } else {
    return {
      type,
      value,
      children
    }
  }
}

const createAST = parseTree => {
  // document.getElementById('ast').innerHTML = `<pre>${JSON.stringify(parseTree.flatMap(createASTNode), null, 2)}</pre>`
  // return parseTree.map(mapNode)
  return parseTree.flatMap(createASTNode)
}

export default createAST
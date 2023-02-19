export const createASTNode = (node, parentNode) => {
  const { action, value, type, children, start = 0, end = 0 } = node

  // Perform sematic action on node
  if (typeof action === 'function') {
    let ASTNode

    if (children) {
      ASTNode = action(
        {
          type,
          children: children.flatMap(child => createASTNode(child, node)),
          start,
          end,
        },
        parentNode
      )
    } else ASTNode = action({ type, value, start, end }, parentNode)

    if (ASTNode === null) return []

    return ASTNode
  } else {
    return {
      type,
      value,
      children,
      start,
      end,
    }
  }
}

export const createAST = parseTree => parseTree.flatMap(createASTNode)

import { TOKENS } from './tokens'
import defaultAction from './default-action'

const createParseTree = (state, parentNode = null, tree = []) => {
  const { token, tokenMeta, complete, lhs: type, action = defaultAction, previous } = state
  const { SYMBOL, TERMINAL, INTERMEDIATE } = TOKENS
  const nodeType = complete ? SYMBOL : token !== undefined ? TERMINAL : INTERMEDIATE
  const node = {
    nodeType,
    type,
    token,
    tokenMeta
  }

  // Not all states should have actions, only completed rules
  if (complete) {
    node.action = action
  }

  if (nodeType === TERMINAL) {
    node.value = token
  }

  if (nodeType !== TERMINAL) {
    node.children = []
  }

  if (!parentNode) {
    tree.push(node)
  } else {
    parentNode.children.unshift(node)
  }

  parentNode = nodeType === SYMBOL ? node : parentNode

  let i = previous.length

  while (i) {
    createParseTree(previous[i - 1], parentNode, tree)

    i--
  }

  return tree
}

export default createParseTree

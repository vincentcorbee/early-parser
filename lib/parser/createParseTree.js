import { TOKENS } from './'

const defaultAction = list => [list[0], list.slice(1)]

export const createParseTree = (state, parentNode = null, tree = []) => {
  const { token, complete, lhs, action = defaultAction, previous } = state
  const { SYMBOL, TERMINAL, INTERMEDIATE } = TOKENS
  const type = complete ? SYMBOL : token ? TERMINAL : INTERMEDIATE
  const node = {
    nodeType: type,
    type: lhs,
  }

  // Not all states should have actions, only completed rules
  if (complete) {
    node.action = action
  }

  if (type === TERMINAL) {
    node.value = token
  }

  if (type !== TERMINAL) {
    node.children = []
  }

  if (!parentNode) {
    tree.push(node)
  } else {
    parentNode.children.unshift(node)
  }

  parentNode = type === SYMBOL ? node : parentNode

  let i = previous.length

  while (i) {
    createParseTree(previous[i - 1], parentNode, tree)

    i--
  }

  return tree
}

import { TOKENS } from '../../../constants/constants'
import { defaultAction } from './default-action'

let end = []
let start = 0

const getLengthOfToken = token =>
  typeof token === 'string' ? token.length : token.toString().length

export const createParseTree = (
  state,
  parentNode = null,
  previousToken = null,
  tree = []
) => {
  if (tree.length === 0) {
    end = []
    start = 0
  }

  const {
    token,
    tokenMeta,
    complete,
    lhs: type,
    action = defaultAction,
    previous,
  } = state
  const { SYMBOL, TERMINAL, INTERMEDIATE } = TOKENS
  const nodeType = complete ? SYMBOL : token !== undefined ? TERMINAL : INTERMEDIATE
  const node = {
    nodeType,
    type,
    start: 0,
    end: 0,
  }

  let newPreviousToken = previousToken

  if (tokenMeta) {
    node.tokenMeta = tokenMeta
    node.start = tokenMeta.index
    node.end = node.start + getLengthOfToken(tokenMeta.value)

    start = node.start

    end.push(node.end)

    if (parentNode && parentNode.end === undefined) {
      parentNode.end = node.end
      parentNode.start = node.start
    } else if (parentNode) parentNode.start = node.start

    newPreviousToken = tokenMeta
  } else if (previousToken) {
    node.end = previousToken.index
  }

  // Not all states should have actions, only completed ones
  if (complete) node.action = action

  if (nodeType === TERMINAL) node.value = token

  if (nodeType !== TERMINAL) node.children = []

  if (!parentNode) tree.push(node)
  else parentNode.children.unshift(node)

  parentNode = nodeType === SYMBOL ? node : parentNode

  let i = previous.length

  while (i) {
    createParseTree(previous[i - 1], parentNode, newPreviousToken, tree)

    i--
  }

  node.end = node.end || end[0]

  node.start = node.start || start

  return tree
}

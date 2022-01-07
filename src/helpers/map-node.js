
import flattenList from "./flattenList"

const map = node => {
  node = Array.isArray(node) ? node : [node]

  // Get type returned from the semantic action
  const type =
    node.length > 1 && typeof node[0] === 'string' ? node.splice(0, 1)[0] : null

  return node.map(child => {
    if (Array.isArray(child)) {
      child = child.map(mapNode)
    } else if (child !== undefined && child.type) {
      child = mapNode(child)
    } else if (child !== undefined) {
      child = [child]
    }

    if (child !== undefined && type) {
      child.type = type
    }

    return child
  })[0]
}

const mapNode = node => {
  const { action, value, type, children } = node

  // Perform sematic action on node
  if (typeof action === 'function') {
    let list

    if (children) {
      list = action([type, ...children])
    } else {
      list = action([type, value])
    }

    if (list === null) {
      return []
    }

    list = map(list)

    return Array.isArray(list) && !list.type ? flattenList(list, true) : list
  } else {
    return [value !== undefined ? value : node]
  }
}

export default mapNode
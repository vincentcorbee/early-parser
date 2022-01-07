const createNewElement = (type = null, attributes = null, ns = null) => {
  if (!type) {
    throw new ReferenceError('Type is not supplied')
  }

  attributes = Array.isArray(attributes) ? attributes : null
  let el

  if (ns) {
    el = document.createElementNS(ns[0], type)
  } else if (type === 'documentFragment') {
    el = document.createDocumentFragment()
  } else {
    el = document.createElement(type)
  }
  if (attributes) {
    attributes.forEach(keyvalue => {
      const [attribute, value] = keyvalue.split(/=([\S\s]+)?/)

      if (attribute === 'content') {
        el.textContent = value
      } else if (attribute === 'innerHTML') {
        el.innerHTML = value
      } else if (attribute) {
        el.setAttribute(attribute, value === undefined ? '' : value)
      }
    })
  }
  return el
}

export default createNewElement

const append = (parent, ...children) => {
  children.forEach(child => child && parent.appendChild(child))

  return parent
}

export default append

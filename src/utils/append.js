const append = (parent, ...children) => {
  children.forEach(child => {
    if (child) parent.appendChild(child)
  })
  return parent
}

export default append

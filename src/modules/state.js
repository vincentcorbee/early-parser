export class State {
  constructor({ lhs, left, right, dot, from, action, previous }) {
    this.lhs = lhs
    this.left = left
    this.right = right
    this.dot = dot
    this.from = from
    this.previous = previous ? [...previous] : []
    this.action = action
    this.nextNonTerminal = null
  }

  get complete() {
    return !this.right.length
  }

  getTransitiveKey() {
    return `${this.lhs}${this.right.join('')}${this.left.join('')}`
  }

  isNullable() {
    return this.left.length === 0 && this.right.length === 0
  }

  hasRightRecursion(grammer) {
    if (this.right.length > 1) return false

    if (this.right.length === 1) {
      const [symbol] = this.right

      return symbol === this.lhs && !!grammer[symbol]
    }

    if (this.right.length === 0 && this.left.length > 0) {
      const symbol = this.left[this.left.length - 1]

      return symbol === this.lhs && !!grammer[symbol]
    }

    if (this.left === 0) return !!grammer[this.lhs]

    return false
  }

  expectNonTerminal(grammer) {
    const [rhs] = this.right

    this.nextNonTerminal = rhs && grammer[rhs]

    return !!this.nextNonTerminal
  }

  expectTerminal(grammer) {
    const [rhs] = this.right

    return !!(rhs && !grammer[rhs])
  }

  addPrevious(state) {
    this.previous.push(state)
  }

  toString() {
    return `${this.lhs}${this.right.join('')}${this.left.join('')}${this.from}`
  }
}

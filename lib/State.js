export default class State {
  constructor({ lhs, left, right, dot, from, action }) {
    this.lhs = lhs
    this.left = left
    this.right = right
    this.dot = dot
    this.from = from
    this.id = (State.prototype.id || 0) + 1
    this.previous = []
    this.action = action

    State.prototype.id = this.id
  }

  get complete() {
    return !this.right.length
  }

  expectNonTerminal(grammer) {
    const rhs = this.right[0]

    return rhs && grammer.some(rule => rule.lhs === rhs)
  }
}

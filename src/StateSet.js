import State from './State'

class StateSet {
  states = []
  keys = {}

  constructor() {}

  getKey(stateLike) {
    if (stateLike instanceof State) return stateLike.toString()

    return `${stateLike.lhs}${stateLike.right.join('')}${stateLike.left.join('')}${
      stateLike.from
    }`
  }

  add(stateLike) {
    const key = this.getKey(stateLike)

    if (this.keys[key] !== undefined) return null

    const state = stateLike instanceof State ? stateLike : new State(stateLike)

    this.states.push(state)

    this.keys[key] = this.keys.length - 1

    return state
  }

  *[Symbol.iterator]() {
    for (const entry of this.states) {
      yield entry
    }
  }
}

export default StateSet

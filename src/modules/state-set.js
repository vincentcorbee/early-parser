import { State } from './state'

export class StateSet {
  constructor() {
    this.states = []
    this.keys = {}
  }

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

    this.keys[key] = this.states.length - 1

    return state
  }

  has(stateLike) {
    return this.keys[this.getKey(stateLike)] !== undefined
  }

  get(stateLike) {
    const key = this.getKey(stateLike)

    const index = this.keys[key]

    if (!index) return undefined

    return this.states[index]
  }

  forEach(cb) {
    return this.states.forEach(cb)
  }

  filter(cb) {
    return this.states.filter(cb)
  }

  find(cb) {
    return this.states.find(cb)
  }

  *[Symbol.iterator]() {
    for (const entry of this.states) {
      yield entry
    }
  }
}

import { StateSet } from './state-set'

export class Chart {
  columns = []

  add() {
    const stateSet = new StateSet()

    this.columns.push(stateSet)

    return stateSet
  }

  get(index) {
    return this.columns[index]
  }

  *[Symbol.iterator]() {
    for (const column of this.columns) {
      yield column
    }
  }
}

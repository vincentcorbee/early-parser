import { StateSet } from '../../state-set'

export const addToChart = (chart, index, state) => {
  let stateSet = chart[index]

  if (!stateSet) {
    stateSet = new StateSet()

    chart[index] = stateSet
  }

  return stateSet.add(state)
}

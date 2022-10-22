import inStateSet from './in-state-set'
import State from '../State'

const addToChart = (chart, index, state) => {
  let stateSet = chart[index]

  if (!stateSet) {
    stateSet = []

    stateSet.keys = {}

    chart[index] = stateSet
  }

  const inSet = inStateSet(stateSet, state)

  if (!inSet) {
    const newState = new State(state)

    stateSet.keys[newState.toString()] = true

    stateSet.push(newState)

    return newState
  }

  return null
}

export default addToChart

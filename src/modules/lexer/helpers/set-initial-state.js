import { DEFAULT_TOKEN } from "../constants/constants"

const setInitialState = (self, _private) => {
  const { states } = _private.get(self)
  const INITIAL_STATE = {
    name: 'INITIAL',
    tokens: [DEFAULT_TOKEN],
    error: null,
    start: 0,
    end: null,
  }

  _private.get(self).states = states.length ? states.map(state => {
    const newState = {
      ...state,
      start: 0,
      end: null
    }

    if (newState.fn) newState.fn(self)

    return newState
  }) : [INITIAL_STATE]

  _private.get(self).state = _private.get(self).states[0]
}

export default setInitialState
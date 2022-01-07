import { DEFAULT_TOKEN } from "../constants/constants"

const setInitialState = (self, _private) => {
  const { states } = _private.get(self)
  const state = {
    name: 'INITIAL',
    tokens: states.length ? states[0].tokens : [DEFAULT_TOKEN],
    error: null,
    start: 0,
    end: null,
  }

  _private.get(self).state = state
  _private.get(self).states = [state]
}

export default setInitialState
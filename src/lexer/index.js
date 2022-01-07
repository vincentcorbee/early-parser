import { throwError, setInitialState, TOKEN } from "./helpers"

const _private = new WeakMap()

export default class Lexer {
  constructor() {
    _private.set(this, {
      throwError,
      input: '',
      index: 0,
      col: 0,
      line: 1,
      state: null,
      states: [],
    })

    setInitialState(this, _private)
  }
  set line(num) {
    _private.get(this).line = num
  }
  get line() {
    return _private.get(this).line
  }
  set col(num) {
    _private.get(this).col = num
  }
  get col() {
    return _private.get(this).col
  }
  set index(num) {
    _private.get(this).index = num
  }
  get index() {
    return _private.get(this).index
  }
  get source() {
    return _private.get(this).input
  }
  reset() {
    setInitialState(this, _private)

    this.index = 0
    this.col = 0
    this.line = 1
  }
  error(fn) {
    _private.get(this).state.error = fn
  }
  state(name, fn) {
    const { states, state } = _private.get(this)
    const newState = {
      name,
      tokens: [],
      error: null,
      start: self.index,
      end: null,
    }

    _private.get(this).state = newState

    fn(this)

    states.push(newState)

    _private.get(this).state = state
  }
  input(input) {
    _private.get(this).input = input
  }
  tokens(tokens = []) {
    const { state } = _private.get(this)

    state.tokens = tokens.flatMap(token => {
      if (!token) return []

      if (Array.isArray(token)) {
        const [ type, reg ] = token

        return {
          type,
          reg: typeof reg === 'string' ? new RegExp(`^${reg}`) : reg,
        }
      } else {
        if (typeof token.reg === 'string') token.reg = new RegExp(`^${token.reg}`)

        return token
      }
    })
  }
  ignore(reg) {
    _private.get(this).state.tokens.unshift({
      type: 'IGNORE',
      reg,
    })
  }
  skip(num) {
    this.index += num

    return this.readToken()
  }
  peak() {
    const curIndex = this.index
    const curLine = this.line
    const curCol = this.col
    const curState = _private.get(this).state
    const token = this.readToken()

    this.index = curIndex
    this.line = curLine
    this.col = curCol

    _private.get(this).state = curState

    return token
  }
  readToken() {
    const self = this
    const { throwError, state, states, input } = _private.get(self)

    if (!input) {
      return null
    }

    const tokens = state.tokens
    const str = input.substring(self.index)

    if (str.length === 0) {
      return null
    }

    let token = null

    for (const tok of tokens) {
      const reg = tok.reg
      const result = str.match(reg)

      if (result) {
        const [match] = result

        const curIndex = self.index
        const curCol = self.col
        const curLine = self.line

        self.col += match.length
        self.index += match.length

        if (tok.type === 'IGNORE') {
          return self.readToken()
        }

        if (tok.type === 'NEWLINE') {
          // This token should be handle the what happens here
          if (typeof tok.cb === 'function') {
            if (!tok.cb(self)) {
              return self.readToken()
            }
          } else {
            self.line += 1
            self.col = 0

            return self.readToken()
          }
        }

        if (tok.begin) {
          const newState = states.find(state => state.name === tok.begin)

          newState.start = self.index

          state.end = curIndex

          _private.get(self).state = newState

          if (typeof tok.cb === 'function') {
            tok.cb(input.substring(state.start, state.end), self)
          }

          return self.readToken()
        }

        token = TOKEN(
          tok.type,
          tok.value ? tok.value(match) : match,
          curLine,
          curCol,
          curIndex
        )

        if (token) return token
      }
    }

    if (state.error) {
      return state.error(this)
    } else {
      throwError(`Lexer: Illegal character ${str[0]} `, this.line, this.col)
    }
  }
}

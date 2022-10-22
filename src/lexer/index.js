import { throwError, setInitialState, TOKEN } from './helpers'

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
      start: this.index,
      end: null,
      fn,
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
        const [type, reg] = token
        const test = reg || type.toLowerCase()

        return {
          type,
          reg: typeof test === 'string' ? new RegExp(`^${test}(?= )`) : test,
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
    const { throwError, state, states, input } = _private.get(this)

    if (!input) return null

    const tokens = state.tokens
    const str = input.substring(this.index)

    if (str.length === 0) return null

    let token = null

    for (const tok of tokens) {
      const reg = tok.reg
      const result = str.match(reg)

      if (result) {
        const [match] = result

        const curIndex = this.index
        const curCol = this.col
        const curLine = this.line

        this.col += match.length
        this.index += match.length

        if (tok.type === 'IGNORE') return this.readToken()

        if (tok.type === 'NEWLINE') {
          if (typeof tok.cb !== 'function') {
            this.line += 1
            this.col = 0

            return this.readToken()
          } else if (typeof tok.cb === 'function' && !tok.cb(this)) {
            return this.readToken()
          }
        }

        // console.log(this.line, this.col, this.index, str)

        if (tok.begin) {
          const newState = states.find(state => state.name === tok.begin)

          newState.start = this.index

          state.end = curIndex

          _private.get(this).state = newState

          if (typeof tok.cb === 'function')
            tok.cb(input.substring(state.start, state.end), this)

          return this.readToken()
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

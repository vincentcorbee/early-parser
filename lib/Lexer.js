const _private = new WeakMap()

const DEFAULT_TOKEN = {
  type: 'SYMBOL',
  reg: /./,
}

const setInitialState = self => {
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

const throwError = (msg, line, col) => {
  throw new Error(`${msg} (line: ${line}, col: ${col})`)
}

const TOKEN = (type, value, line, col, index) => ({
  type,
  value,
  line,
  col,
  index,
})

class Lexer {
  constructor() {
    const self = this

    _private.set(self, {
      TOKEN,
      throwError,
      input: '',
      index: 0,
      col: 0,
      line: 1,
      state: null,
      states: [],
      setInitialState,
    })
    setInitialState(self)
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
    const self = this
    const { setInitialState } = _private.get(self)
    setInitialState(self)

    self.index = 0
    self.col = 0
    self.line = 1
  }
  error(fn) {
    _private.get(this).state.error = fn
  }
  state(name, fn) {
    const self = this
    const { states, state } = _private.get(self)
    const newState = {
      name,
      tokens: [],
      error: null,
      start: self.index,
      end: null,
    }
    _private.get(self).state = newState
    fn(self)
    states.push(newState)
    _private.get(self).state = state
  }
  input(input) {
    _private.get(this).input = input
  }
  tokens(tokens = []) {
    const self = this
    const { state } = _private.get(self)

    state.tokens = []

    tokens.forEach(token => {
      if (Array.isArray(token)) {
        state.tokens.push({
          type: token[0],
          reg: token[1],
        })
      } else {
        state.tokens.push(token)
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
    const self = this
    const curIndex = self.index
    const curLine = self.line
    const curCol = self.col
    const curState = _private.get(self).state
    const token = this.readToken()

    self.index = curIndex
    self.line = curLine
    self.col = curCol
    _private.get(self).state = curState

    return token
  }
  readToken() {
    const self = this
    const { TOKEN, throwError, state, states, input } = _private.get(self)

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
      let match = str.match(reg)

      if (match) {
        match = match[0]

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
          if (tok.cb && typeof tok.cb === 'function') {
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

          if (tok.cb && typeof tok.cb === 'function') {
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

        if (token) {
          return token
        }
      }
    }

    if (state.error) {
      return state.error(self)
    } else {
      throwError(`Lexer: Illegal character ${str[0]} `, self.line, self.col)
    }
  }
}
export default Lexer

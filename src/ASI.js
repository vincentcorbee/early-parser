const Tokens = {
  NEWLINE: 'NEWLINE',
  RCBRACE: 'RCBRACE',
}

const SEMI = ';'
const RCBRACE = '}'

// ASI RULES
// 1. A semicolon is inserted before, when a Line terminator or "}" is encountered that is not allowed by the grammar.
// 2. A semicolon is inserted at the end, when the end of the input stream of tokens is detected and the parser is unable to parse the single input stream as a complete program.
// 3. A semicolon is inserted at the end, when a statement with restricted productions in the grammar is followed by a line terminator.

const ASI = (parser, err) => {
  const { token, prevToken, chart } = err
  const { lexer } = parser
  const optSemi = chart[chart.length - 1].find(
    state => state.lhs === 'OptSemi' && !state.complete
  )

  if (token) {
    if (prevToken.type === Tokens.NEWLINE || prevToken.type === Tokens.RCBRACE) {
      if (optSemi && lexer.source[prevToken.index - 1] !== SEMI) {
        const { index, col, line } = prevToken

        lexer.input(
          lexer.source.substring(0, index) + SEMI + lexer.source.substring(index)
        )

        lexer.index = index
        lexer.col = col
        lexer.line = line
      } else {
        lexer.index = token.index
        lexer.col = token.col
        lexer.line = token.line
      }

      parser.index = parser.index ? parser.index - 2 : parser.index

      return parser.resumeParse()
    } else {
      throw SyntaxError(
        `Unexpected token ${prevToken.value} (${prevToken.line}:${prevToken.col})`
      )
    }
  } else {
    const index = lexer.source.length - 1
    const prevSymbol = lexer.source[index]

    if (optSemi && lexer.source[index - 1] !== SEMI && prevSymbol === RCBRACE) {
      lexer.input(lexer.source.substring(0, index - 1) + SEMI + RCBRACE)

      lexer.index = lexer.source.length - 2
      parser.index = parser.index ? parser.index - 2 : parser.index

      return parser.resumeParse(parser)
    } else if (optSemi && prevSymbol !== SEMI) {
      lexer.input(lexer.source + SEMI)

      lexer.index = lexer.source.length - 1
      parser.index = parser.index ? parser.index - 2 : parser.index

      return parser.resumeParse(parser)
    } else if (prevToken) {
      throw SyntaxError(
        `Unexpected token ${prevToken.value} (${prevToken.line}:${prevToken.col})`
      )
    } else {
      throw SyntaxError(`Unexpected end of input`)
    }
  }
}

export default ASI

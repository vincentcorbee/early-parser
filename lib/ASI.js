const ASI = (parser, err) => {
  const { token, prevToken, chart } = err
  const self = parser
  const { lexer } = self
  const optSemi = chart[chart.length - 1].find(
    state => state.lhs === 'OptSemi' && !state.complete
  )

  if (token) {
    // Error handling, still tokens left, parsing error
    // ASI RULES
    // 1. A semicolon is inserted before, when a Line terminator or "}" is encountered that is not allowed by the grammar.
    // 2. A semicolon is inserted at the end, when the end of the input stream of tokens is detected and the parser is unable to parse the single input stream as a complete program.
    // 3. A semicolon is inserted at the end, when a statement with restricted productions in the grammar is followed by a line terminator.

    if (prevToken.type === 'NEWLINE') {
      if (optSemi && lexer.source[prevToken.index - 1] !== ';') {
        let i = prevToken.index

        lexer.input(lexer.source.substring(0, i) + ';' + lexer.source.substring(i))
        lexer.index = i
      } else {
        lexer.index = prevToken.index + prevToken.value.length
      }

      self.index = self.index ? self.index - 2 : self.index

      return self.resumeParse()
    } else {
      throw SyntaxError(
        `Parsing Error (line: ${prevToken.line}, col: ${prevToken.col}) of input stream`
      )
    }
  } else {
    // See ASI RULES above
    if (optSemi && lexer.source[lexer.source.length - 1] !== ';') {
      lexer.input(lexer.source + ';')

      lexer.index = lexer.source.length - 1
      self.index = self.index ? self.index - 2 : self.index

      return self.resumeParse(self)
    } else {
      throw SyntaxError(`Unexpected end of input`)
    }
  }
}
export default ASI

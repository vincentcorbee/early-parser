export default [
  {
    type: 'NUMBER',
    reg: /^[0-9]+(?:\.?[0-9]+)*/,
    value: num => parseFloat(num),
  },
  ['EQUAL', /^==/],
  ['ASSIGN', /^=/],
  ['SEMI', /^;/],
  ['IF', /^if/],
  ['ELSE', /^else/],
  ['PLUS', /^\+/],
  ['MINUS', /^\-/],
  ['MUL', /^\*/],
  ['LPAREN', /^\(/],
  ['RPAREN', /^\)/],
  ['SEMI', /^;/]
  // ['SYMBOL', /./],
  ['IDENT', /^[$a-zA-Z]+(?:[a-zA-Z_\-]+)*/],
  // {
  //   type: 'STRING',
  //   reg: /^(?:"(?:[^"\\]|(?:\\.))*")|'(?:[^'\\]|(?:\\.))*'/,
  //   value: str => str.slice(1, -1),
  // },
  // {
  //   type: 'BEGINCOMMENT',
  //   reg: /^\/\*/,
  //   begin: 'COMMENT'
  // },
  // {
  //   type: 'NEWLINE',
  //   reg: /^[\n\r]/,
  //   cb: lex => {
  //     lex.line += 1
  //     lex.col = 0
  //     // If set to true newlines are tokenized and used for automated semicolon insertion
  //     return true
  //   }
  // },
]

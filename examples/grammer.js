const grammer = [
  // {
  //   exp: 'A : x | y A | y A z A',
  // },
  {
    exp: 'Stmts : Stmt | Stmt Stmts',
  },
  {
    exp: 'Stmt : Matched | Unmatched',
  },
  {
    exp: 'Matched : Assign SEMI | IF LPAREN BooleanExpr RPAREN Matched ELSE Matched',
  },
  {
    exp:
      'Unmatched : IF LPAREN BooleanExpr RPAREN Stmt | IF LPAREN BooleanExpr RPAREN Matched ELSE Unmatched',
  },
  {
    exp: 'Assign : IDENT ASSIGN IDENT',
  },
  {
    exp: 'BooleanExpr : IDENT EQUAL IDENT',
  },
  // {
  //   exp: 'S : STRING',
  //   action: list => ['string', list[1].value]
  // },
  // {
  //   exp: 'Sum : Sum PLUS Product | Sum MINUS Product | Product',
  //   //action: list => list.length === 2 ? [list[1]] : ['list', [list[1], list[2].value, list[3]]],
  // },
  // {
  //   exp: 'Product : Product MUL Factor | Factor',
  //   //action: list => list.length === 4 ? ['list', [list[1], list[2].value, list[3]]]: [list[1]],
  // },
  // {
  //   exp: 'Factor : LPAREN Sum RPAREN | Number',
  //   //action: list => list.length === 2 ? [list[1]] : [list[2]],
  // },
  // {
  //   exp: 'Number : NUMBER',
  //   // action: list => [list[1].value],
  // },
  // {
  //   exp: 'Prog : TopStmts',
  //   action: list => ['program', list[1]]
  // },
]
export default grammer

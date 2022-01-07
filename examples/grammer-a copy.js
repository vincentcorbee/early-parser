import { EMPTY } from "../src/constants/constants"

const grammer = [
  /* Programs */
  {
    exp: 'Program : TopStatements',
    action: ([name, ...rest]) => {
      const node = [name, rest]

      console.log(rest)

      return node
    }
  },
  {
    exp: `TopStatements :
        ${EMPTY}
      | TopStatementsPrefix`,
    // action: list => [list[1]]
  },
  {
    exp: `TopStatementsPrefix :
        TopStatement
      | TopStatementsPrefix TopStatement`,
    // action: list => {
    //   console.log(list[0], list[1])
    //   return [list]
    // }
  },
  {
    exp: 'TopStatement : Statement | FunctionDefinition',
    // action: list => [list[1]]
  },
  /* Expressions */
  /* Primary Expressions */
  {
    exp: `PrimaryExpression :
        SimpleExpression
      | ObjectLiteral
      | FunctionExpression`,
    action: list => [list[1]],
  },
  {
    exp: `SimpleExpression :
        This
      | Null
      | Boolean
      | String
      | Number
      | Identifier
      | ParenthesizedExpression
      | ArrayLiteral`,
    action: list => [list[1]],
  },
  {
    exp: 'ParenthesizedExpression : LPAREN Expression RPAREN',
    action: list => [list[2]],
  },
  /* Function Expressions */
  {
    exp: 'FunctionExpression : AnonymousFunction | NamedFunction'
  },
  /* Object literals */
  {
    exp: 'ObjectLiteral : LCBRACE RCBRACE | LCBRACE FieldList RCBRACE',
    action: list =>
      list.length === 4 ? ['objectLiteral', [list[2]]] : ['objectLiteral', []],
  },
  {
    exp: 'FieldList : LiteralField | FieldList COMMA LiteralField',
    action: list => (list.length === 4 ? [[list[1], list[3]]] : [list[1]]),
  },
  {
    exp: 'LiteralField : Identifier PERIOD AssignmentExpression',
    action: list => [[list[1], list[3]]],
  },
  /* Array literals  */
  {
    exp: 'ArrayLiteral : LBRACK RBRACK | LBRACK ElementList RBRACK',
    action: list =>
      list.length === 4 ? ['arrayLiteral', [list[2]]] : ['arrayLiteral', []],
  },
  {
    exp: 'ElementList : LiteralElement | ElementList COMMA LiteralElement',
    action: list => (list.length === 4 ? [list[1], list[3]] : [list[1]]),
  },
  {
    exp: 'LiteralElement : AssignmentExpression',
    action: list => [list[1]],
  },
  /* Left-Side expression */
  {
    exp: `LeftSideExpression :
        CallExpression
      | ShortNewExpression`,
    action: list => [list[1]],
  },
  {
    exp: 'ShortNewExpression : NEW ShortNewSubexpression'
  },
  {
    exp: 'FullNewExpression : NEW FullNewSubexpression Arguments'
  },
  {
    exp: 'ShortNewSubexpression : FullNewSubexpression | ShortNewExpression'
  },
  {
    exp: `FullNewSubexpression :
        PrimaryExpression
      | FullNewExpression
      | FullNewSubexpression MemberOperator`
  },
  {
    exp: `CallExpression :
        PrimaryExpression
      | CallExpression Arguments
      | CallExpression  MemberOperator
      | FullNewExpression`,
    action: list => {
      if (list.length === 3) {
        if (list[2].type === 'MemberOperator') {
          return ['accessor', [list[1], list[2]]]
        } else {
          return ['call', [list[1], list[2]]]
        }
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: 'MemberOperator : LBRACK Expression RBRACK | DOT Identifier',
    action: list => [list[2]],
  },
  {
    exp: 'Arguments : LPAREN RPAREN | LPAREN ArgumentList RPAREN',
    action: list => (list.length === 3 ? ['Arguments', []] : ['args', [list[2]]]),
  },
  {
    exp: 'ArgumentList : AssignmentExpression | ArgumentList COMMA AssignmentExpression',
    action: list => (list.length === 4 ? [[list[1], list[3]]] : [[list[1]]]),
  },
  /* Postfix Operators */
  {
    exp: `PostfixExpression :
        LeftSideExpression
      | LeftSideExpression INCREMENT | LeftSideExpression DECREMENT`
  },
  /* Statements */
  {
    exp: `Statement :
        EmptyStatement
      | ExpressionStatement OptSemi
      | VariableDefinition OptSemi
      | Block
      | IfStatement
      | SwitchStatement
      | DoStatement OptSemi
      | WhileStatement
      | ForStatement
      | BreakStatement OptSemi
      | ReturnStatement OptSemi`,
    action: list => [list[1]],
  },
  /* Empty Statement */
  {
    exp: 'EmptyStatement : SEMI',
    action: () => null,
  },
  {
    exp: 'ExpressionStatement : Expression',
    action: list => [list[1]],
  },
  {
    exp: 'OptSemi : SEMI',
    action: () => null
  },
  /* Block */
  {
    exp: 'Block : LCBRACE BlockStatements RCBRACE'
  },
  {
    exp: `BlockStatements :
        ${EMPTY}
      | BlockStatementsPrefix`
  },
  {
    exp: `BlockStatementsPrefix :
        Statement
      | BlockStatementsPrefix Statement`
  },
  /* Return Statement */
  {
    exp: 'ReturnStatement : RETURN OptionalExpression'
  },
  /* Continue and Break Statements */
  {
    exp: 'BreakStatement : BREAK OptionalLabel'
  },
  {
    exp: 'ContinueStatement : CONTINUE OptionalLabel'
  },
  {
    exp: `OptionalLabel : ${EMPTY} | Identifier`
  },
  /* For Statements */
  {
    exp: 'ForStatement : FOR LPAREN ForInitializer SEMI OptionalExpression SEMI OptionalExpression RPAREN Statement'
  },
  {
    exp: `ForInitializer : ${EMPTY} | Expression | LET VariableDeclarationList`
  },
  {
    exp: 'ForInBinding : LeftSideExpression | LET VariableDeclaration'
  },
  /* Switch Statement */
  {
    exp: `SwitchStatement :
        SWITCH ParenthesizedExpression LCBRACE RCBRACE
      | SWITCH ParenthesizedExpression LCBRACE CaseGroups LastCaseGroup RCBRACE`
  },
  {
    exp: `CaseGroups : ${EMPTY} | CaseGroups CaseGroup`
  },
  {
    exp: 'CaseGroup : CaseGuards BlockStatementsPrefix'
  },
  {
    exp: 'LastCaseGroup : CaseGuards BlockStatements'
  },
  {
    exp: 'CaseGuards : CaseGuard | CaseGuards CaseGuard'
  },
  {
    exp: 'CaseGuard : CASE Expression PERIOD | DEFAULT PERIOD'
  },
  /* Do-While Statement */
  {
    exp: 'DoStatement : DO Statement WHILE ParenthesizedExpression'
  },
  /* While Statement */
  {
    exp: 'WhileStatement : WHILE ParenthesizedExpression Statement'
  },
  /* If Statement */
  {
    exp: `IfStatement :
        IF ParenthesizedExpression Statement
      | IF ParenthesizedExpression Statement ELSE Statement`
  },
  {
    exp: 'VariableDefinition : LET VariableDeclarationList'
  },
  {
    exp: `VariableDeclarationList :
        VariableDeclaration
      | VariableDeclarationList COMMA VariableDeclaration`
  },
  {
    exp: 'VariableDeclaration : Identifier VariableInitializer'
  },
  {
    exp: 'VariableInitializer : EQUAL AssignmentExpression'
  },
  {
    exp: `Expression :
        AssignmentExpression
      | Expression COMMA AssignmentExpression`,
    action: list => (list.length === 4 ? [[list[1], list[3]]] : [list[1]]),
  },
  {
    exp: `OptionalExpression :
        Expression
      | ${EMPTY}`
  },
  {
    exp: `AssignmentExpression :
        ConditionalExpression
      | LeftSideExpression EQUAL AssignmentExpression
      | LeftSideExpression CompAs AssignmentExpression`,
    action: list => {
      if (list.length === 4) {
        return [
          'assign',
          [list[1], list[2].value === '=' ? list[2].value : list[2], list[3]],
        ]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `CompAs :
        "*="
      | "/="
      | "%="
      | "+="
      | "-="
      | "<<="
      | ">>="
      | ">>>="
      | "&="
      | "^="
      | "|="`,
    action: list => [list[1].value],
  },
  {
    exp: `ConditionalExpression :
        LogicalOrExpression
      | LogicalOrExpression TENARY AssignmentExpression PERIOD AssignmentExpression`,
    action: list => {
      if (list.length === 6) {
        return ['tenary', [list[1], list[3], list[5]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `LogicalOrExpression :
        LogicalAndExpression
      | LogicalOrExpression LOGOR LogicalAndExpression`,
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `LogicalAndExpression :
        BitOrExp
      | LogicalAndExpression LOGAND BitOrExp`,
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: 'BitOrExp :  BitXorExp | BitOrExp BINOR BitXorExp',
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: 'BitXorExp :  BitAndExp | BitXorExp XOR BitAndExp',
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: 'BitAndExp :  EqExp | BitAndExp BINAND EqExp',
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `EqExp :
        RelExp
      | EqExp EQUALEQUAL RelExp
      | EqExp NOTEQUAL RelExp
      | EqExp STRICTEQUAL RelExp
      | EqExp NOTSTRICTEQUAL RelExp`,
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `RelExp :
        ShiftExpression
      | RelExp LT ShiftExpression
      | RelExp GT ShiftExpression
      | RelExp LTEQ ShiftExpression
      | RelExp GTEQ ShiftExpression`,
    action: list => {
      if (list.length === 4) {
        return ['binop', [list[1], list[2].value, list[3]]]
      } else {
        return [list[1]]
      }
    },
  },
  {
    exp: `ShiftExpression :
        AdditiveExpression
      | ShiftExpression "<<" AdditiveExpression
      | ShiftExpression ">>" AdditiveExpression
      | ShiftExpression ">>>" AdditiveExpression`,
    action: list =>
      list.length === 4 ? ['binop', [list[1], list[2].value, list[3]]] : [list[1]],
  },
  {
    exp: `AdditiveExpression :
        MultiplicativeExpression
      | AdditiveExpression PLUS MultiplicativeExpression
      | AdditiveExpression MINUS MultiplicativeExpression`,
    action: list =>
      list.length === 4 ? ['binop', [list[1], list[2].value, list[3]]] : [list[1]],
  },
  {
    exp: `MultiplicativeExpression :
        UnaryExpression
      | MultiplicativeExpression MULTIPLY UnExp
      | MultiplicativeExpression MODULUS UnaryExpression`,
    action: list =>
      list.length === 4 ? ['binop', [list[1], list[2].value, list[3]]] : [list[1]],
  },
  {
    exp: `UnaryExpression :
        PostfixExpression
      | PLUS UnaryExpression
      | MINUNS UnaryExpression`,
    action: list => (list.length === 3 ? ['unop', [list[1], list[2]]] : [list[1]]),
  },
  {
    exp: `PostfixExpression :
        LeftSideExpression
      | LeftSideExpression PLUSPLUS
      | LeftSideExpression MINMIN`,
    action: list => [list[1]],
  },
  {
    exp: 'Identifier : IDENTIFIER',
    action: list => [
      list[1].value === 'undefined' ? 'undefined' : 'identifier',
      list[1].value,
    ],
  },
  {
    exp: 'Number : NUMBER',
    action: list => ['number', list[1].value],
  },
  {
    exp: 'String : STRING',
    action: list => ['string', list[1].value],
  },
  {
    exp: 'Null : NULL',
    action: list => ['null', list[1].value],
  },
  {
    exp: 'This : THIS',
    action: list => ['this', list[1].value],
  },
  {
    exp: 'Boolean : TRUE | FALSE',
    action: list => ['boolean', list[1].value],
  },
  /* Function Definition */
  {
    exp: 'FunctionDefinition : NamedFunction'
  },
  {
    exp: 'NamedFunction : FUNCTION Identifier FormalParametersAndBody'
  },
  {
    exp: 'AnonymousFunction : FUNCTION FormalParametersAndBody'
  },
  {
    exp: 'FormalParametersAndBody :  LPAREN FormalParameters RPAREN LCBRACE TopStatements RCBRACE'
  },
  {
    exp: `FormalParameters :
        ${EMPTY}
      | FormalParametersPrefix`
  },
  {
    exp: 'FormalParametersPrefix : FormalParameter | FormalParametersPrefix COMMA FormalParameter'
  },
  {
    exp: 'FormalParameter : Identifier'
  },
]
export default grammer

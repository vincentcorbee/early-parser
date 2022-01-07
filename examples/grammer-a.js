import { EMPTY } from "../src/constants/constants"

const createNewExpressionNode = ({ children }) => ({
  type: 'NewExpression',
  callee: children[1],
  arguments: children[2] ? children[2].children : []
})

const createUnaryExpressionNode = ({ type, children }) => {
  const [operator, argument] = children

  return {
    type,
    operator: operator.value,
    argument,
    prefix: false
  }
}

const createUpdateExpressionNode = ({ children }) => {
  const [argument, operator] = children

  return {
    type: "UpdateExpression",
    operator: operator.value,
    argument,
    prefix: false
  }
}

const createBinaryExpressionNode = ({ children }) => {
  const [ left, operator, right ] = children

  if (children.length === 1) return left

  if (children.lenght === 2) return createUpdateExpressionNode({ children })

  return {
    type: "BinaryExpression",
    operator: operator.value,
    left,
    right
  }
}

const createLogicalExpressionNode = ({ children }) => {
  const [ left, operator, right ] = children

  if (children.length === 1) return left

  return {
    type: "LogicalExpression",
    operator,
    left,
    right
  }
}

const createLeafNode = ({ children, type }) => ({
  type,
  name: children[0].value
})

const skipNode = ({ children }) => children

const returnValueFromNode = ({ children }) => children[0].value

const createNodeList = ({ children }) => {
  if (children.length === 0) return [[]]
  if (children.length === 1) return [children]

  children[0].push(children[2])

  return [children[0]]
}

const grammer = [
  /* Programs */
  {
    exp: `Program :
        SourceElements`,
    action: ({ type, children: body }) => ({
      type,
      body
    })
  },
  {
    exp: `SourceElements :
        ${EMPTY}
      | SourceElement
      | SourceElements SourceElement`,
    action: skipNode
  },
  {
    exp: `SourceElement :
        Statement
      | FunctionDeclaration`,
    action: skipNode
  },
  /* Expressions */
  /* Primary Expressions */
  {
    exp: `PrimaryExpression :
        SimpleExpression
      | ObjectLiteral
      | FunctionExpression`,
    action: skipNode
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
    action: skipNode
  },
  {
    exp: 'ParenthesizedExpression : LPAREN Expression RPAREN',
    action: node => node.children[1]
  },
  /* Function Expressions */
  {
    exp: `FunctionExpression :
        AnonymousFunction
      | FunctionDeclaration`,
    action: ({ children }) => {
      children[0].type = 'FunctionExpression'

      return children
    }
  },
  /* Object literals */
  {
    exp: `ObjectLiteral :
        LCBRACE RCBRACE
      | LCBRACE FieldList RCBRACE`,
    action: ({ type, children }) =>
      ({
        type,
        properties: children.length === 2 ? [] : children[1]
      })
  },
  {
    exp: `FieldList :
        LiteralField
      | FieldList COMMA LiteralField`,
    action: createNodeList
  },
  {
    exp: 'LiteralField : Identifier PERIOD AssignmentExpression',
    action: ({ children }) => ({
      type: "Property",
      key: children[0],
      value: children[2],
      kind: "init"
    }),
  },
  /* Array literals  */
  {
    exp: `ArrayLiteral :
        LBRACK RBRACK
      | LBRACK ElementList RBRACK`,
    action: ({ children }) =>
      ({
        type: 'ArrayExpression',
        elements: children.length === 2 ? [] : children[1]
      })
  },
  {
    exp: `ElementList :
        LiteralElement
      | ElementList COMMA LiteralElement`,
    action: createNodeList
  },
  {
    exp: 'LiteralElement : AssignmentExpression',
    action: skipNode
  },
  /* Left-Side expression */
  {
    exp: `LeftSideExpression :
        CallExpression
      | ShortNewExpression`,
    action: skipNode
  },
  {
    exp: 'ShortNewExpression : NEW ShortNewSubexpression',
    action: createNewExpressionNode
  },
  {
    exp: 'FullNewExpression : NEW FullNewSubexpression Arguments',
    action: createNewExpressionNode
  },
  {
    exp: `ShortNewSubexpression :
        FullewSubexpression
      | ShortNewExpression`,
    action: skipNode
  },
  {
    exp: `FullNewSubexpression :
        PrimaryExpression
      | FullNewExpression
      | FullNewSubexpression MemberOperator`,
    action: ({ children }) => {
      if (children.length === 1) return children

      return {
        type: 'MemberExpression',
        propery: children[1].property,
        object: children[0],
        computed: children[1].computed
      }
    },
  },
  {
    exp: `CallExpression :
        PrimaryExpression
      | FullNewExpression
      | CallExpression Arguments
      | CallExpression MemberOperator`,
    action: ({ children }) => {
      if (children.length === 1) return children

      if(children[1].type === 'MemberOperator') {
        return {
          type: 'MemberExpression',
          propery: children[1].property,
          object: children[0],
          computed: children[1].computed
        }
      }

      if (children[1].type === 'Arguments') {
        return {
          type: 'CallExpression',
          callee: children[0],
          arguments: children[1].children
        }
      }

      return children[1]
    },
  },
  {
    exp: `MemberOperator :
        LBRACK Expression RBRACK
      | DOT Identifier`,
    action: ({ type, children }) => ({
      type,
      property: children[1],
      computed: children.length === 3
    })
  },
  {
    exp: `Arguments :
        LPAREN RPAREN
      | LPAREN ArgumentList RPAREN`,
    action: ({ type, children }) => ({
      type,
      children: children.length === 3 ? children[1] : []
    })
  },
  {
    exp: `ArgumentList :
        AssignmentExpression
      | ArgumentList COMMA AssignmentExpression`,
    action: createNodeList
  },
  /* Postfix Operators */
  {
    exp: `PostfixExpression :
        LeftSideExpression
      | LeftSideExpression INCREMENT
      | LeftSideExpression DECREMENT`,
    action: ({ children }) => {
      if(children.length === 2) return createUpdateExpressionNode({ children: [children[0], children[1]] })

      return children
    }
  },
  /* Statements */
  {
    exp: `Statement :
        EmptyStatement
      | ExpressionStatement OptSemi
      | VariableStatement OptSemi
      | BlockStatement
      | IfStatement
      | SwitchStatement
      | DoWhileStatement OptSemi
      | WhileStatement
      | ForStatement
      | ContinueStatement OptSemi
      | BreakStatement OptSemi
      | ReturnStatement OptSemi`,
    action: skipNode
  },
  /* Empty Statement */
  {
    exp: 'EmptyStatement : SEMI',
    action: ({ type }) => ({ type }),
  },
  {
    exp: 'ExpressionStatement : Expression',
    action: ({ type, children }) => ({ type, expression: children[0] })
  },
  {
    exp: 'OptSemi : SEMI',
    action: () => null
  },
  /* Block Statement*/
  {
    exp: 'BlockStatement : LCBRACE BlockStatements RCBRACE',
    action: ({ type, children }) => ({
      type,
      body: children[1]
    })
  },
  {
    exp: `BlockStatements :
        ${EMPTY}
      | BlockStatementsPrefix`,
    action: ({ children }) => [children]
  },
  {
    exp: `BlockStatementsPrefix :
        Statement
      | BlockStatementsPrefix Statement`,
    action: skipNode
  },
  /* Return Statement */
  {
    exp: 'ReturnStatement : RETURN OptionalExpression'
  },
  /* Continue and Break Statements */
  {
    exp: `BreakStatement :
        BREAK OptionalLabel`,
    action: ({ type, children }) => ({ type, label: children[1] || null })
  },
  {
    exp: `ContinueStatement :
        CONTINUE OptionalLabel`,
    action: ({ type, children }) => ({ type, label: children[1] || null })
  },
  {
    exp: `OptionalLabel :
        ${EMPTY}
      | Identifier`,
    action: skipNode
  },
  /* For Statements */
  {
    exp: 'ForStatement : FOR LPAREN ForInitializer SEMI OptionalExpression SEMI OptionalExpression RPAREN Statement',
    action: ({ type, children }) => ({
      type,
      init: children[2],
      test: children[4],
      update: children[6],
      body: children[8]
    })
  },
  {
    exp: `ForInitializer :
        ${EMPTY}
      | Expression
      | VAR VariableDeclarationList`,
    action({ children } ) {
      if (children.length === 2) {
        return {
          type: 'VariableDeclaration',
          declarations: [children[1]],
          kind: returnValueFromNode({ children })
        }
      }

      return children
     }
  },
  {
    exp: 'ForInBinding : LeftSideExpression | VAR VariableDeclaration'
  },
  /* Switch Statement */
  {
    exp: `SwitchStatement :
        SWITCH ParenthesizedExpression LCBRACE RCBRACE
      | SWITCH ParenthesizedExpression LCBRACE CaseGroups LastCaseGroup RCBRACE`
  },
  {
    exp: `CaseGroups :
        ${EMPTY}
      | CaseGroups CaseGroup`
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
    exp: `DoWhileStatement :
        DO Statement WHILE ParenthesizedExpression`,
    action: ({ children, type }) => ({
      type,
      body: children[1],
      test: children[3]
    })
  },
  /* While Statement */
  {
    exp: `WhileStatement :
        WHILE ParenthesizedExpression Statement`,
    action: ({ children, type }) => ({
      type,
      body: children[2],
      test: children[1]
    })
  },
  /* If Statement */
  {
    exp: `IfStatement :
        IF ParenthesizedExpression Statement
      | IF ParenthesizedExpression Statement ELSE Statement`,
    action: ({ type, children }) => ({
      type,
      test: children[1],
      consequent: children[2],
      alternate: children.length === 5 ? children[4] : null
    })
  },
  {
    exp: 'VariableStatement : VAR VariableDeclarationList',
    action: ({ children }) => ({
      type: 'VariableDeclaration',
      declarations: children[1],
      kind: returnValueFromNode({ children })
    })
  },
  {
    exp: `VariableDeclarationList :
        VariableDeclaration
      | VariableDeclarationList COMMA VariableDeclaration`,
    action: createNodeList
  },
  {
    exp: `VariableDeclaration :
        Identifier VariableInitializer
      | Identifier`,
    action: ({ children }) => ({
      type: 'VariableDeclarator',
      id: children[0],
      init: children[1] || null
    })
  },
  {
    exp: 'VariableInitializer : EQUAL AssignmentExpression',
    action: ({ children }) => children[1]
  },
  {
    exp: `Expression :
        AssignmentExpression
      | Expression COMMA AssignmentExpression`,
    action: skipNode
  },
  {
    exp: `OptionalExpression :
        Expression
      | ${EMPTY}`,
    action: skipNode
  },
  {
    exp: `AssignmentExpression :
        ConditionalExpression
      | LeftSideExpression EQUAL AssignmentExpression
      | LeftSideExpression CompoundAssignment AssignmentExpression`,
    action({ type, children }){
      const [ left, operator, right ] = children

      if (children.length === 1) return left

      return {
        type,
        operator,
        left,
        right
      }
    }
  },
  {
    exp: `CompoundAssignment :
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
    action: returnValueFromNode
  },
  {
    exp: `ConditionalExpression :
        LogicalOrExpression
      | LogicalOrExpression TENARY AssignmentExpression PERIOD AssignmentExpression`,
    action({ type, children }){
      if (children.length === 1) return children[0]

      return {
        type,
        test: children[0],
        alternate: children[2],
        consequence: children[4]
      }
    }
  },
  {
    exp: `LogicalOrExpression :
        LogicalAndExpression
      | LogicalOrExpression LOGOR LogicalAndExpression`,
    action: createLogicalExpressionNode
  },
  {
    exp: `LogicalAndExpression :
        BitwiseOrExpression
      | LogicalAndExpression LOGAND BitwiseOrExpression`,
    action: createLogicalExpressionNode
  },
  {
    exp: `BitwiseOrExpression :
        BitwiseXorExpression
      | BitwiseOrExpression BINOR BitwiseXorExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `BitwiseXorExpression :
        BitwiseAndExpression
      | BitwiseXorExpression XOR BitwiseAndExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `BitwiseAndExpression :
        EqualityExpression
      | BitwiseAndExpression BINAND EqualityExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `EqualityExpression :
        RelationalExpression
      | EqualityExpression EQUALEQUAL RelationalExpression
      | EqualityExpression NOTEQUAL RelationalExpression
      | EqualityExpression STRICTEQUAL RelationalExpression
      | EqualityExpression NOTSTRICTEQUAL RelationalExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `RelationalExpression :
        ShiftExpression
      | RelationalExpression LT ShiftExpression
      | RelationalExpression GT ShiftExpression
      | RelationalExpression LTEQ ShiftExpression
      | RelationalExpression GTEQ ShiftExpression
      | RelationalExpression INSTANCEOF ShiftExpression
      | RelationalExpression IN ShiftExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `ShiftExpression :
        AdditiveExpression
      | ShiftExpression "<<" AdditiveExpression
      | ShiftExpression ">>" AdditiveExpression
      | ShiftExpression ">>>" AdditiveExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `AdditiveExpression :
        MultiplicativeExpression
      | AdditiveExpression PLUS MultiplicativeExpression
      | AdditiveExpression MINUS MultiplicativeExpression`,
    action: createBinaryExpressionNode
  },
  {
    exp: `MultiplicativeExpression :
        UnaryExpression
      | MultiplicativeExpression MULTIPLY UnExp
      | MultiplicativeExpression MODULUS UnaryExpression`,
    action: skipNode
  },
  {
    exp: `UnaryExpression :
        PostfixExpression
      | DELETE LeftSideExpression
      | VOID UnaryExpression
      | TYPEOF UnaryExpression
      | INCREMENT LeftSideExpression
      | DECREMENT LeftSideExpression
      | PLUS UnaryExpression
      | MINUS UnaryExpression
      | NOT UnaryExpression
      | LOGNOT UnaryExpression`,
    action: (node) => {
      if (node.children.length === 1) return skipNode(node)

      const { children } = node

      if (['++', '--'].includes(children[0].value)) return createUpdateExpressionNode({ children: [children[1], children[0]] })

      return createUnaryExpressionNode(node)
    }
  },
  {
    exp: 'Identifier : IDENTIFIER',
    action: createLeafNode
  },
  {
    exp: 'Number : NUMBER',
    action: createLeafNode
  },
  {
    exp: 'String : STRING',
    action: createLeafNode
  },
  {
    exp: 'Null : NULL',
    action: createLeafNode
  },
  {
    exp: 'This : THIS',
    action: createLeafNode
  },
  {
    exp: 'Boolean : TRUE | FALSE',
    action: createLeafNode
  },
  /* Function Declaration */
  {
    exp: 'FunctionDeclaration : FUNCTION Identifier FormalParametersListAndBody',
    action: ({ type, children }) => ({
      type,
      id: children[1],
      params: children[2],
      body: children[3]
    })
  },
  {
    exp: 'AnonymousFunction : FUNCTION FormalParametersListAndBody',
    action: ({ type, children }) => ({
      type,
      id: null,
      params: children[1],
      body: children[2]
    })
  },
  {
    exp: 'FormalParametersListAndBody : LPAREN FormalParameterList RPAREN LCBRACE FunctionBody RCBRACE',
    action: ({ children }) =>
      [children[1], {
        type: 'BlockStatement',
        body: children[4]
      }]
  },
  {
    exp: 'FunctionBody : SourceElements',
    action: ({ children }) => children.length ? [children] : [[]]
  },
  {
    exp: `FormalParameterList :
        ${EMPTY}
      | Identifier
      | FormalParameterList COMMA Identifier`,
    action: createNodeList
  },
]

export default grammer

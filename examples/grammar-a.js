import { EMPTY } from '../src/constants/constants'

const createSwitchStatementNode = ({ children, type }) => ({
  type,
  discriminant: children[0],
  cases: children[3] ? [children[3], children[4]] : [],
})

const createArrowExpressionNode = ({ children, start, end }) => ({
  type: 'ArrowFunctionExpression',
  start,
  end,
  params: children[0],
  body: children[2],
})

const createSwitchCaseNode = ({ children }) => ({
  type: 'SwitchCase',
  test: children[0],
  consequent: children[1],
})

const createNewExpressionNode = ({ children }) => ({
  type: 'NewExpression',
  callee: children[1],
  arguments: children[2] ? children[2].children : [],
})

const createUnaryExpressionNode = ({ type, children }) => {
  const [operator, argument] = children

  return {
    type,
    operator: operator.value,
    argument,
    prefix: false,
  }
}

const createUpdateExpressionNode = ({ children }) => {
  const [argument, operator] = children

  return {
    type: 'UpdateExpression',
    operator: operator.value,
    argument,
    prefix: false,
  }
}

const createBinaryExpressionNode = ({ children }) => {
  const [left, operator, right] = children

  if (children.length === 1) return left

  if (children.lenght === 2) return createUpdateExpressionNode({ children })

  return {
    type: 'BinaryExpression',
    operator: operator.value,
    left,
    right,
  }
}

const createLogicalExpressionNode = ({ children }) => {
  const [left, operator, right] = children

  if (children.length === 1) return left

  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

const createLeafNode = ({ children, type, start, end }) => ({
  type,
  start,
  end,
  name: children[0].value,
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
    action: ({ type, children: body, start, end }) => ({
      type,
      start,
      end,
      body,
      directives: [],
    }),
  },
  {
    exp: `SourceElements :
        ${EMPTY}
      | SourceElement
      | SourceElements SourceElement`,
    action: skipNode,
  },
  {
    exp: `SourceElement :
        Statement
      | FunctionDeclaration
      | LexicalDeclaration OptSemi`,
    action: skipNode,
  },
  /* Expressions */
  /* Primary Expressions */
  {
    exp: `PrimaryExpression :
        SimpleExpression
      | ObjectLiteral
      | FunctionExpression`,
    action: skipNode,
  },
  {
    exp: `SimpleExpression :
        This
      | Null
      | Boolean
      | StringLiteral
      | Number
      | Identifier
      | ParenthesizedExpression
      | ArrayLiteral`,
    action: skipNode,
  },
  {
    exp: 'ParenthesizedExpression : LPAREN Expression RPAREN',
    action: node => node.children[1],
  },
  /* Function Expressions */
  {
    exp: `FunctionExpression :
        AnonymousFunction
      | FunctionDeclaration`,
    action: ({ children }) => {
      children[0].type = 'FunctionExpression'

      return children
    },
  },
  /* Object literals */
  {
    exp: `ObjectLiteral :
        LCBRACE RCBRACE
      | LCBRACE FieldList RCBRACE`,
    action: ({ type, children }) => ({
      type,
      properties: children.length === 2 ? [] : children[1],
    }),
  },
  {
    exp: `FieldList :
        LiteralField
      | FieldList COMMA LiteralField`,
    action: createNodeList,
  },
  {
    exp: `LiteralField :
        Identifier PERIOD AssignmentExpression`,
    action: ({ children }) => ({
      type: 'Property',
      key: children[0],
      value: children[2],
      kind: 'init',
    }),
  },
  /* Array literals  */
  {
    exp: `ArrayLiteral :
        LBRACK RBRACK
      | LBRACK ElementList RBRACK`,
    action: ({ children }) => ({
      type: 'ArrayExpression',
      elements: children.length === 2 ? [] : children[1],
    }),
  },
  {
    exp: `ElementList :
        LiteralElement
      | ElementList COMMA LiteralElement`,
    action: createNodeList,
  },
  {
    exp: 'LiteralElement : AssignmentExpression',
    action: skipNode,
  },
  /* Left-Side expression */
  {
    exp: `LeftSideExpression :
        CallExpression
      | ShortNewExpression`,
    action: skipNode,
  },
  {
    exp: `ShortNewExpression :
        NEW ShortNewSubexpression`,
    action: createNewExpressionNode,
  },
  {
    exp: `FullNewExpression :
        NEW FullNewSubexpression Arguments`,
    action: createNewExpressionNode,
  },
  {
    exp: `ShortNewSubexpression :
        FullNewSubexpression
      | ShortNewExpression`,
    action: skipNode,
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
        computed: children[1].computed,
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

      if (children[1].type === 'MemberOperator') {
        return {
          type: 'MemberExpression',
          propery: children[1].property,
          object: children[0],
          computed: children[1].computed,
        }
      }

      if (children[1].type === 'Arguments') {
        return {
          type: 'CallExpression',
          callee: children[0],
          arguments: children[1].children,
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
      computed: children.length === 3,
    }),
  },
  {
    exp: `Arguments :
        LPAREN RPAREN
      | LPAREN ArgumentList RPAREN`,
    action: ({ type, children }) => ({
      type,
      children: children.length === 3 ? children[1] : [],
    }),
  },
  {
    exp: `ArgumentList :
        AssignmentExpression
      | ArgumentList COMMA AssignmentExpression`,
    action: createNodeList,
  },
  /* Postfix Operators */
  {
    exp: `PostfixExpression :
        LeftSideExpression
      | LeftSideExpression INCREMENT
      | LeftSideExpression DECREMENT`,
    action: ({ children }) => {
      if (children.length === 2)
        return createUpdateExpressionNode({ children: [children[0], children[1]] })

      return children
    },
  },
  /* Statements */
  {
    exp: `Statement :
        EmptyStatement
      | ExpressionStatement OptSemi
      | VariableStatement OptSemi
      | Block
      | IfStatement
      | SwitchStatement
      | DoWhileStatement OptSemi
      | WhileStatement
      | ForStatement
      | ContinueStatement OptSemi
      | BreakStatement OptSemi
      | ReturnStatement OptSemi,
      | ThrowStatement OptSemi
      | TryStatement`,
    action: skipNode,
  },
  /* Empty Statement */
  {
    exp: 'EmptyStatement : SEMI',
    action: ({ type }) => ({ type }),
  },
  {
    exp: `ExpressionStatement :
        Expression`,
    action: ({ type, children, start }) => ({ type, start, expression: children[0] }),
  },
  {
    exp: 'OptSemi : SEMI',
    action: () => null,
  },
  /* Block Statement*/
  {
    exp: `Block :
        LCBRACE BlockStatements RCBRACE`,
    action: ({ children }) => ({
      type: 'BlockStatement',
      body: children[1],
    }),
  },
  {
    exp: `BlockStatements :
        ${EMPTY}
      | BlockStatementsPrefix`,
    action: ({ children }) => [children],
  },
  {
    exp: `BlockStatementsPrefix :
        Statement
      | BlockStatementsPrefix Statement`,
    action: skipNode,
  },
  /* Return Statement */
  {
    exp: 'ReturnStatement : RETURN OptionalExpression',
    action: ({ type, children, start, end }) => ({
      type,
      start,
      end,
      argument: children[1],
    }),
  },
  /* Continue and Break Statements */
  {
    exp: `BreakStatement :
        BREAK OptionalLabel`,
    action: ({ type, children }) => ({ type, label: children[1] || null }),
  },
  {
    exp: `ContinueStatement :
        CONTINUE OptionalLabel`,
    action: ({ type, children }) => ({ type, label: children[1] || null }),
  },
  {
    exp: `OptionalLabel :
        ${EMPTY}
      | Identifier`,
    action: skipNode,
  },
  /* For Statements */
  {
    exp: `ForStatement :
        FOR LPAREN ForInitializer SEMI OptionalExpression SEMI OptionalExpression RPAREN Statement
      | FOR LPAREN ForInBinding IN Expression RPAREN Statement`,
    action: ({ type, children }) => {
      if (children.length === 9) {
        return {
          type,
          init: children[2],
          test: children[4],
          update: children[6],
          body: children[8],
        }
      }

      return {
        type: 'ForInStatement',
        left: children[2],
        right: children[4],
        body: children[6],
      }
    },
  },
  {
    exp: `ForInitializer :
        ${EMPTY}
      | Expression
      | VAR VariableDeclarationList`,
    action({ children }) {
      if (children.length === 2) {
        return {
          type: 'VariableDeclaration',
          declarations: [children[1]],
          kind: returnValueFromNode({ children }),
        }
      }

      return children
    },
  },
  {
    exp: `ForInBinding :
        LeftSideExpression
      | VAR VariableDeclaration`,
    action({ children }) {
      if (children.length === 2) {
        return {
          type: 'VariableDeclaration',
          declarations: [children[1]],
          kind: returnValueFromNode({ children }),
        }
      }

      return children
    },
  },
  /* Switch Statement */
  {
    exp: `SwitchStatement :
        SWITCH ParenthesizedExpression LCBRACE RCBRACE
      | SWITCH ParenthesizedExpression LCBRACE CaseGroups LastCaseGroup RCBRACE`,
    action: createSwitchStatementNode,
  },
  {
    exp: `CaseGroups :
        ${EMPTY}
      | CaseGroups CaseGroup`,
    action: skipNode,
  },
  {
    exp: `CaseGroup :
        CaseGuards BlockStatementsPrefix`,
    action: createSwitchCaseNode,
  },
  {
    exp: `LastCaseGroup :
        CaseGuards BlockStatements`,
    action: createSwitchCaseNode,
  },
  {
    exp: `CaseGuards :
        CaseGuard
      | CaseGuards CaseGuard`,
    action: skipNode,
  },
  {
    exp: `CaseGuard :
        CASE Expression PERIOD
      | DEFAULT PERIOD`,
    action: ({ children }) => (children.length === 3 ? children[1] : [null]),
  },
  /* Do-While Statement */
  {
    exp: `DoWhileStatement :
        DO Statement WHILE ParenthesizedExpression`,
    action: ({ children, type }) => ({
      type,
      body: children[1],
      test: children[3],
    }),
  },
  /* While Statement */
  {
    exp: `WhileStatement :
        WHILE ParenthesizedExpression Statement`,
    action: ({ children, type }) => ({
      type,
      body: children[2],
      test: children[1],
    }),
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
      alternate: children.length === 5 ? children[4] : null,
    }),
  },
  {
    exp: `LexicalDeclaration : LetOrConst BindingList`,
    action: ({ children }) => ({
      type: 'VariableDeclaration',
      declarations: children[1],
      kind: returnValueFromNode({ children }),
    }),
  },
  {
    exp: `LetOrConst :
        LET
      | CONST`,
  },
  {
    exp: `BindingList :
        LexicalBinding
      | BindingList COMMA LexicalBinding`,
    action: createNodeList,
  },
  {
    exp: `LexicalBinding :
        BindingIdentifier Initializer?
      | BindingPattern Initializer`,
    action: ({ children }) => ({
      type: 'VariableDeclarator',
      id: children[0],
      init: children[1] || null,
    }),
  },
  {
    exp: 'VariableStatement : VAR VariableDeclarationList',
    action: ({ children }) => ({
      type: 'VariableDeclaration',
      declarations: children[1],
      kind: returnValueFromNode({ children }),
    }),
  },
  {
    exp: `VariableDeclarationList :
        VariableDeclaration
      | VariableDeclarationList COMMA VariableDeclaration`,
    action: createNodeList,
  },
  {
    exp: `VariableDeclaration : BindingIdentifier Initializer?`,
    action: ({ children }) => ({
      type: 'VariableDeclarator',
      id: children[0],
      init: children[1] || null,
    }),
  },
  {
    exp: 'Initializer : EQUAL AssignmentExpression',
    action: ({ children }) => children[1],
  },
  {
    exp: `TryStatement :
        TRY Block Catch
      | TRY Block Finally
      | TRY Block Catch Finally`,
    action: ({ type, children }) => {
      const hasCatchClause = children[2].type === 'CatchClause'

      return {
        type,
        block: children[1],
        handler: hasCatchClause ? children[2] : null,
        finalizer: (hasCatchClause ? children[3] : children[2]) || null,
      }
    },
  },
  {
    exp: `Catch :
        CATCH LPAREN Identifier RPAREN Block`,
    action: ({ children }) => ({
      type: 'CatchClause',
      param: children[2],
      body: children[4],
    }),
  },
  {
    exp: `Finally :
        FINALLY Block`,
    action: ({ children }) => children[1],
  },
  {
    exp: `ThrowStatement :
        THROW Expression`,
    action: ({ type, children }) => ({
      type,
      argument: children[1],
    }),
  },
  {
    exp: `Expression :
        AssignmentExpression
      | SequenceExpression`,
    action: skipNode,
  },
  {
    exp: `SequenceExpression :
        Expression COMMA AssignmentExpression`,
    action: ({ children }) => ({
      type: 'SequenceExpression',
      expressions: [children[0], children[2]],
    }),
  },
  {
    exp: `OptionalExpression :
        Expression
      | ${EMPTY}`,
    action: skipNode,
  },
  {
    exp: `AssignmentExpression :
        ConditionalExpression
      | ArrowFunction
      | LeftSideExpression EQUAL AssignmentExpression
      | LeftSideExpression CompoundAssignment AssignmentExpression`,
    action({ type, children }) {
      const [left, operator, right] = children

      if (children.length === 1) return left

      return {
        type,
        operator,
        left,
        right,
      }
    },
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
    action: returnValueFromNode,
  },
  {
    exp: `ConditionalExpression :
        LogicalOrExpression
      | LogicalOrExpression TENARY AssignmentExpression PERIOD AssignmentExpression`,
    action({ type, children }) {
      if (children.length === 1) return children[0]

      return {
        type,
        test: children[0],
        alternate: children[2],
        consequence: children[4],
      }
    },
  },
  {
    exp: `LogicalOrExpression :
        LogicalAndExpression
      | LogicalOrExpression LOGOR LogicalAndExpression`,
    action: createLogicalExpressionNode,
  },
  {
    exp: `LogicalAndExpression :
        BitwiseOrExpression
      | LogicalAndExpression LOGAND BitwiseOrExpression`,
    action: createLogicalExpressionNode,
  },
  {
    exp: `BitwiseOrExpression :
        BitwiseXorExpression
      | BitwiseOrExpression BINOR BitwiseXorExpression`,
    action: createBinaryExpressionNode,
  },
  {
    exp: `BitwiseXorExpression :
        BitwiseAndExpression
      | BitwiseXorExpression XOR BitwiseAndExpression`,
    action: createBinaryExpressionNode,
  },
  {
    exp: `BitwiseAndExpression :
        EqualityExpression
      | BitwiseAndExpression BINAND EqualityExpression`,
    action: createBinaryExpressionNode,
  },
  {
    exp: `EqualityExpression :
        RelationalExpression
      | EqualityExpression EQUALEQUAL RelationalExpression
      | EqualityExpression NOTEQUAL RelationalExpression
      | EqualityExpression STRICTEQUAL RelationalExpression
      | EqualityExpression NOTSTRICTEQUAL RelationalExpression`,
    action: createBinaryExpressionNode,
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
    action: createBinaryExpressionNode,
  },
  {
    exp: `ShiftExpression :
        AdditiveExpression
      | ShiftExpression "<<" AdditiveExpression
      | ShiftExpression ">>" AdditiveExpression
      | ShiftExpression ">>>" AdditiveExpression`,
    action: createBinaryExpressionNode,
  },
  {
    exp: `AdditiveExpression :
        MultiplicativeExpression
      | AdditiveExpression PLUS MultiplicativeExpression
      | AdditiveExpression MINUS MultiplicativeExpression`,
    action: createBinaryExpressionNode,
  },
  {
    exp: `MultiplicativeExpression :
        UnaryExpression
      | MultiplicativeExpression MULTIPLY UnaryExpression
      | MultiplicativeExpression MODULUS UnaryExpression`,
    action: skipNode,
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
    action: node => {
      if (node.children.length === 1) return skipNode(node)

      const { children } = node

      if (['++', '--'].includes(children[0].value))
        return createUpdateExpressionNode({ children: [children[1], children[0]] })

      return createUnaryExpressionNode(node)
    },
  },
  {
    exp: 'Identifier : IDENTIFIER',
    action: createLeafNode,
  },
  {
    exp: `BindingIdentifier : Identifier`,
    action: skipNode,
  },
  {
    exp: 'Number : NUMBER',
    action: createLeafNode,
  },
  {
    exp: 'StringLiteral : STRING',
    action: createLeafNode,
  },
  {
    exp: 'Null : NULL',
    action: createLeafNode,
  },
  {
    exp: 'This : THIS',
    action: createLeafNode,
  },
  {
    exp: 'Boolean : TRUE | FALSE',
    action: createLeafNode,
  },
  /* Function Declaration */
  {
    exp: 'FunctionDeclaration : FUNCTION Identifier FormalParametersListAndBody',
    action: ({ type, children }) => ({
      type,
      id: children[1],
      params: children[2],
      body: children[3],
    }),
  },
  {
    exp: 'AnonymousFunction : FUNCTION FormalParametersListAndBody',
    action: ({ type, children }) => ({
      type,
      id: null,
      params: children[1],
      body: children[2],
    }),
  },
  {
    exp: 'FormalParametersListAndBody : LPAREN FormalParameterList RPAREN LCBRACE FunctionBody RCBRACE',
    action: ({ children }) => [
      children[1],
      {
        type: 'BlockStatement',
        body: children[4],
      },
    ],
  },
  {
    exp: 'FunctionBody : SourceElements',
    action: ({ children }) => (children.length ? [children] : [[]]),
  },
  {
    exp: `ArrowFunction : ArrowParameters ARROW ConciseBody`,
    action: createArrowExpressionNode,
  },
  {
    exp: `ArrowParameters :
        BindingIdentifier
     |  CoverParenthesizedExpressionAndArrowParameterList`,
    action: skipNode,
  },
  {
    exp: `ConciseBody :
        AssignmentExpression
      | LCBRACE FunctionBody RCBRACE`,
    action: ({ children, start, end }) =>
      children.length === 1
        ? children[0]
        : {
            type: 'BlockStatement',
            start,
            end,
            body: children[1],
          },
  },
  {
    exp: `CoverParenthesizedExpressionAndArrowParameterList : ArrowFormalParameters`,
    action: skipNode,
  },
  {
    exp: `ArrowFormalParameters : LPAREN StrictFormalParameters RPAREN`,
    action: ({ children }) => children[1],
  },
  {
    exp: `StrictFormalParameters : FormalParameters`,
    action: skipNode,
  },
  {
    exp: `FormalParameters :
        ${EMPTY}
      | FormalParameterList`,
    action: skipNode,
  },
  {
    exp: `FormalParameterList :
        ${EMPTY}
      | Identifier
      | FormalParameterList COMMA Identifier`,
    action: createNodeList,
  },
  {
    exp: `ImportDeclaration :
        IMPORT ImportClause FromClause ;
      | IMPORT ModuleSpecifier ;`,
  },
  {
    exp: `ImportClause :
        ImportedDefaultBinding
      | NameSpaceImport
      | NamedImports
      | ImportedDefaultBinding COMMA NameSpaceImport
      | ImportedDefaultBinding COMMA NamedImports`,
  },
  {
    exp: `ImportedDefaultBinding :
        ImportedBinding`,
  },
  {
    exp: `NameSpaceImport :
        MULTIPLY AS ImportedBinding`,
  },
  {
    exp: `NamedImports :
        LPAREN RPAREN
      | LPAREN ImportsList RPAREN
      | LPAREN ImportsList COMMA RPAREN`,
  },
  {
    exp: `FromClause :
        FROM ModuleSpecifier`,
  },
  {
    exp: `ImportsList :
        ImportSpecifier
      | ImportsList COMMA ImportSpecifier`,
  },
  {
    exp: `ImportSpecifier :
        ImportedBinding
      | IdentifierName AS ImportedBinding`,
  },
  {
    exp: `ModuleSpecifier :
        StringLiteral`,
  },
  {
    exp: `ImportedBinding :
        BindingIdentifier`,
  },
]

export default grammer

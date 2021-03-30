import Parser from './src/Parser'
import Lexer from './src/Lexer'

import grammer from './grammer'
import tokens from './tokens'
import { printAST, printParseTree, printChart } from './src/parser/'

const input = document.getElementById('code')
const code = input.value
const chartEl = document.getElementById('chart')
const parseTreeEl = document.getElementById('parseTree')
const astEl = document.getElementById('ast')

const lexer = new Lexer()
const parser = new Parser(lexer)

lexer.tokens(tokens)
lexer.ignore(/^[ \t\v\r]+/)

// Still have to create presidence
lexer.input(code)

parser.grammer(grammer)
parser.error = err => {
  console.log(err)
  printChart(parser.chart, chartEl)
}

parser.parse(() => {
  const AST = parser.AST

  console.log(parser.parseTree)
  console.log(AST)

  printChart(parser.chart, chartEl)

  // The trees created are represented as an array, containing a tree for each finished state

  parser.parseTree.forEach(parseTree => printParseTree(parseTree, parseTreeEl))

  AST.forEach(AST => printAST(AST, astEl))
})

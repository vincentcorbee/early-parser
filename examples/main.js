import { Parser, Lexer } from '../'

import grammer from './grammer-a'
import tokens from './tokens-a'
import { printAST, printParseTree } from '../src/utils'
import { ASI } from '../src'

const input = document.getElementById('code')
const code = input.value
const chartEl = document.getElementById('chart')
const parseTreeEl = document.getElementById('parseTree')
const astEl = document.getElementById('ast')

const lexer = new Lexer()
const parser = new Parser(lexer)

lexer.tokens(tokens)

lexer.state('COMMENT', lexer => {
  lexer.tokens([
    {
      name: 'ENDCOMMENT',
      reg: /^\*\//,
      begin: 'INITIAL',
      cb: (substr, lexer) => (lexer.line += (substr.match(/\n/g) || []).length)
    }
  ])
  lexer.ignore(/^[ \t\v\r]+/)
  lexer.error(lexer => lexer.skip(1))
})
lexer.ignore(/^[ \t\v\r]+/)
lexer.ignore(/^\/\/.*/)

parser.grammer(grammer)

parser.error = err => {
  astEl.innerHTML = '',
  parseTreeEl.innerHTML = ''
  chartEl.innerHTML = ''

  return ASI(parser, err)
}

const parse = (source) => {
  astEl.innerHTML = '',
  parseTreeEl.innerHTML = ''
  chartEl.innerHTML = ''

  lexer.input(source)

  parser.reset()

  parser.parse(({ AST, parseTree }) => {

    // The trees created are represented as an array, containing a tree for each finished state

    // printChart(chart, chartEl)

    parseTree.forEach(parseTree => printParseTree(parseTree, parseTreeEl))

    // AST.forEach(AST => printAST(AST, astEl))

    console.log(lexer.source)
    // console.log(AST)
  })
}

input.addEventListener('input', e => parse(e.target.value))

parse(code)

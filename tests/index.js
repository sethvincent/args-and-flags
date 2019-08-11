const test = require('tape')
const ArgsAndFlags = require('../index')

test('hello args and flags', function (t) {
  const options = {
    args: [
      {
        name: 'hello',
        type: 'string',
        help: 'an argument for saying hello'
      }
    ],
    flags: [
      {
        name: 'message',
        alias: 'm',
        type: 'boolean',
        help: 'a boolean argument'
      },
      {
        name: 'int',
        alias: ['i', 'integer'],
        type: 'integer',
        help: 'an integer argument'
      }
    ]
  }

  const parser = new ArgsAndFlags(options)
  const { args, flags } = parser.parse(['hi', '-m', '--int', '1'])

  t.ok(args.hello === 'hi')
  t.ok(args._ && args._.length === 1)
  t.ok(flags.message === true)
  t.ok(flags.m === true)
  t.ok(flags.int === 1)
  t.ok(flags.integer)

  t.end()
})

test('default values as functions', function (t) {
  const options = {
    args: [
      {
        name: 'hello',
        alias: ['hey', 'hi'],
        type: 'string',
        default: () => { return 'hi' },
        help: 'an argument for saying hello'
      }
    ],
    flags: [
      {
        name: 'int',
        alias: ['i', 'integer'],
        default: () => { return 1 },
        type: 'integer',
        help: 'an integer argument'
      }
    ]
  }

  const parser = new ArgsAndFlags(options)
  const { args, flags } = parser.parse([])
  t.ok(args.hello === 'hi')
  t.ok(flags.int === 1)
  t.ok(flags.integer)

  t.end()
})

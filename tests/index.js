var test = require('tape')

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
      }
    ]
  }

  const parser = new ArgsAndFlags(options)
  const { args, flags } = parser.parse(['hi', '-m'])

  t.ok(args.hello === 'hi')
  t.ok(flags.message === true)
  t.ok(flags.m === true)

  t.end()
})

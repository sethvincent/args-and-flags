const ArgsAndFlags = require('../index')

// node examples/basic-usage.js hi -m ok

const options = {
  args: [
    {
      name: 'required-arg',
      type: 'string',
      help: 'an argument for saying hello',
      required: true
    },
    {
      name: 'hello',
      type: 'string',
      help: 'an argument for saying hello',
      default: 'hey'
    },
    {
      name: 'integer',
      type: 'integer',
      help: 'an integer argument',
      default: 5
    }
  ],
  flags: [
    {
      name: 'toggle',
      alias: 't',
      type: 'boolean',
      help: 'a boolean argument',
      default: true
    },
    {
      name: 'message',
      alias: 'm',
      type: 'string',
      help: 'a string argument',
      required: true
    },
    {
      name: 'defaultValueFunction',
      alias: 'd',
      default: () => { return 'hi' },
      type: 'string',
      help: 'a string argument',
      required: true
    }
  ]
}

const parser = new ArgsAndFlags(options)
const { args, flags } = parser.parse(process.argv.slice(2))

console.log('args', args)
console.log('flags', flags)
console.log(parser.help())

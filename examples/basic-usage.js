const ArgsAndFlags = require('../index')

const options = {
  args: [
    {
      name: 'hello',
      type: 'string',
      help: 'an argument for saying hello',
      default: 'hey'
    }
  ],
  flags: [
    {
      name: 'message',
      alias: 'm',
      type: 'boolean',
      help: 'a boolean argument',
      default: true
    }
  ]
}

const parser = new ArgsAndFlags(options)
const { args, flags } = parser.parse(process.argv.slice(2))

console.log('args', args)
console.log('flags', flags)

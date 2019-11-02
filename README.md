# args-and-flags

An argument parser based on [minimist](https://npmjs.com/minimist) that offers named arguments, flags, validation, and default or required values.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/args-and-flags.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/args-and-flags
[travis-image]: https://img.shields.io/travis/sethvincent/args-and-flags.svg?style=flat-square
[travis-url]: https://travis-ci.org/sethvincent/args-and-flags
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CODE_OF_CONDUCT.md

## Install

```sh
npm install --save args-and-flags
```

> Node v8 and higher is required

## Usage

```js
const ArgsAndFlags = require('args-and-flags')

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
```

## Documentation
- [API](docs/api.md)
- [Tests](tests/)

### Examples
- [Basic example](examples/basic-usage.js)

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Conduct

Help keep this project open and inclusive. Read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Change log

Read about the changes to this project in [CHANGELOG.md](CHANGELOG.md). The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## Contact

- **issues** – Please open issues in the [issues queue](https://github.com/sethvincent/args-and-flags/issues)

## License

[ISC](LICENSE.md)

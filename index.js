import mri from 'mri'
import isBoolean from 'is-boolean-object'
import isRegexp from 'is-regexp'
import wrap from 'wrap-ansi'

/**
* Parse and validate args and flags for cli tools
* @param [args] - arguments
* @param [flags] - flags
* @param [indent] - how many spaces to indent help text
*/
class ArgsAndFlags {
  constructor (options) {
    let { args, flags } = options
    if (!args) args = []
    if (!flags) flags = []
    this.indent = options.indent || 2
    this.argsOptions = args
    this.flagsOptions = flags
    this.argumentParserOptions = {}
    this.argumentParserOptions.boolean = getBooleans(this.flagsOptions)
    this.argumentParserOptions.string = getStrings(this.flagsOptions)
    this.argumentParserOptions.alias = getAlias(this.flagsOptions)
  }

  /**
  * Parse and validate args and flags for cli tools
  * @param {object[]} argsInput - actual args supplied at command line
  * @return {object}
  */
  parse (argsInput) {
    const argumentParserOutput = mri(argsInput, this.argumentParserOptions)

    const argumentParserArgs = argumentParserOutput['_'].reduce((obj, arg, i) => {
      if (!this.argsOptions[i]) {
        obj[arg] = arg
        return obj
      }

      const argType = this.argsOptions[i].type

      if (this.argsOptions[i]) {
        if (this.validate(argType, arg)) {
          obj[this.argsOptions[i].name] = arg
        } else {
          throw new Error(`${arg} must be a ${argType}`)
        }
      }

      return obj
    }, {})

    const checkValues = (options, output) => {
      options.forEach((option) => {
        const aliases = getAllPropertyKeyNames(option).concat(option.name)
        const defaultValue = getDefaultValue(option.default)

        aliases.forEach((alias) => {
          if (!output[alias]) {
            if (!defaultValue && option.required) {
              // TODO: collect all errors
              console.error(new Error(`\`${option.name}\` is required`))
              return process.exit(1)
            }

            output[alias] = defaultValue
          } else {
            this.validate(option.type, output[alias])
          }
        })
      })
    }

    argumentParserArgs._ = argumentParserOutput._
    delete argumentParserOutput._
    const argumentParserFlags = argumentParserOutput

    checkValues(this.argsOptions, argumentParserArgs)
    checkValues(this.flagsOptions, argumentParserFlags)

    return {
      args: argumentParserArgs,
      flags: argumentParserFlags
    }
  }

  validate (type, value) {
    if (!type) return true

    // TODO: this validation could be much smarter.
    // initially the plan was to use json schema. still could.
    if (type === 'string') {
      return typeof value === 'string'
    } else if (type === 'integer') {
      return Number.isInteger(value)
    } else if (type === 'number') {
      return typeof value === 'number'
    } else if (type === 'boolean') {
      return isBoolean(value)
    } else if (type === 'array') {
      return Array.isArray(value)
    } else if (type === 'function') {
      return type(value)
    } else if (isRegexp(type) && typeof value === 'string') {
      return value.match(type)
    }

    throw new Error(`type "${type}" and value ${value} not supported`)
  }

  _createIndent (multiplier) {
    const indent = multiplier ? (this._indent || 1) * multiplier : this._indent
    return ' '.repeat(indent)
  }

  /**
  * Get help information for all args and flags as an object
  * @param {object} [options]
  * @param {string} [options.indent] - amount to indent lines
  * @returns {object}
  */
  helpObject (options) {
    const {
      indent = 2
    } = options

    const argLines = this.argsOptions.map((arg) => {
      return `${this._createIndent(indent)}${arg.name}`
    })

    const flagLines = this.flagsOptions.map((flag) => {
      return `${this._createIndent(indent)}--${flag.name}${this._addFlagAlias(flag)}`
    })

    const longestLine = (argLines.concat(flagLines)).reduce((longest, line) => {
      return line.length > longest ? line.length : longest
    }, 0)

    return {
      args: {
        options: this.argsOptions,
        lines: argLines
      },
      flags: {
        options: this.flagsOptions,
        lines: flagLines
      },
      longestLine
    }
  }

  /**
  * Get help text for all args
  * @param {object} [options]
  * @param {string} [options.argsHeaderText] - header text above list of arguments. default is `Arguments`
  * @param {string} [options.flagsHeaderText] - header text above list of flags. default is `Flags`
  * @param {number} [options.leftColumnWidth] - width of left section in columns. default is the length of the longest arg or flag name
  * @param {number} [options.rightColumnWidth] - width of right section in columns. default is the full width of the terminal minus the leftColumnWidth
  * @param {number} [options.gutter] - width of gutter in columns. default is `4`
  * @returns {string}
  */
  help (options) {
    options = options || {}
    const argLines = this.argsOptions.map((arg) => {
      return `${this._createIndent(2)}${arg.name}`
    })

    const flagLines = this.flagsOptions.map((flag) => {
      return `${this._createIndent(2)}--${flag.name}${this._addFlagAlias(flag)}`
    })

    const longestLine = (argLines.concat(flagLines)).reduce((longest, line) => {
      return line.length > longest ? line.length : longest
    }, 0)

    const args = this.argsHelp(Object.assign(options, { longestLine, lines: argLines }))
    const flags = this.flagsHelp(Object.assign(options, { longestLine, lines: flagLines }))
    return args + '\n\n' + flags
  }

  /**
  * Format description
  * @param {string} text - description text
  * @param {number} leftColumnWidth - width of left section in columns
  * @param {number} rightColumnWidth - width of right section in columns
  * @param {number} gutter - width of gutter in columns
  * @returns {string}
  */
  formatDescription (text, leftColumnWidth, rightColumnWidth, gutter) {
    if (!text) return ''

    if (text.length > rightColumnWidth - gutter) {
      const lines = wrap(text, rightColumnWidth - gutter, { }).split(/\r?\n/).map((line, i) => {
        if (i === 0) return line.trim()
        return ' '.repeat(leftColumnWidth + gutter) + line.trim()
      })

      return lines.join('\n')
    }
    return text
  }

  /**
  * Get help text for all args
  * @param {object} options
  * @param {array} options.lines - lines of text in an array
  * @param {integer} options.longestLine - integer for the longest line in the array of lines (of both args and flags)
  * @param {string} [options.headerText] - header text above list of arguments. default is `Arguments:`
  * @param {number} [options.leftColumnWidth] - width of left section in columns. default is the length of the longest arg or flag name
  * @param {number} [options.rightColumnWidth] - width of right section in columns. default is the full width of the terminal minus the leftColumnWidth
  * @param {number} [options.gutter] - width of gutter in columns. default is `4`
  * @returns {string}
  */
  argsHelp (options) {
    if (!this.argsOptions.length) return ''

    let {
      lines,
      headerText = 'Arguments:',
      longestLine,
      leftColumnWidth = longestLine,
      rightColumnWidth = process.stdout.columns - longestLine,
      gutter = 4
    } = options

    const argumentsHeader = `${this._createIndent()}${headerText}\n`

    if (leftColumnWidth > longestLine) {
      leftColumnWidth = longestLine
    }

    return argumentsHeader + this.argsOptions.map((arg, i) => {
      const line = lines[i]
      const type = arg.type ? arg.type : ''
      const required = arg.required ? 'required' : ''
      const defaultValue = (arg.default) ? `default: ${getDefaultValue(arg.default)}` : ''
      const meta = [type, required, defaultValue].filter((item) => !!item.length).join(', ')
      const description = `${meta ? `(${meta}) ` : ''}${arg.help || arg.description || ''}`
      const width = leftColumnWidth - line.length + gutter
      const padding = width > 0 ? ' '.repeat(width) : ''
      return line + padding + this.formatDescription(description, leftColumnWidth, rightColumnWidth, gutter)
    }).join('\n')
  }

  /**
  * Get help text for all flags
  * @param {object} options
  * @param {array} options.lines - lines of text in an array
  * @param {integer} options.longestLine - integer for the longest line in the array of lines (of both args and flags)
  * @param {string} [options.headerText] - header text above list of flags. default is `Flags:`
  * @param {number} [options.leftColumnWidth] - width of left section in columns. default is the length of the longest arg or flag name
  * @param {number} [options.rightColumnWidth] - width of right section in columns. default is the full width of the terminal minus the leftColumnWidth
  * @param {number} [options.gutter] - width of gutter in columns. default is `4`
  * @returns {string}
  */
  flagsHelp (options) {
    if (!this.flagsOptions.length) return ''
    const defaultWidth = process.stdout.columns / 2

    let {
      lines,
      headerText = 'Flags:',
      longestLine,
      leftColumnWidth = defaultWidth,
      rightColumnWidth = defaultWidth,
      gutter = 4
    } = options

    const flagsHeader = `${this._createIndent()}${headerText}\n`

    if (leftColumnWidth > longestLine) {
      leftColumnWidth = longestLine
    }

    return flagsHeader + this.flagsOptions.map((flag, i) => {
      const line = lines[i]
      const type = flag.type ? flag.type : ''
      const required = flag.required ? 'required' : ''
      const defaultValue = (flag.default) ? `default: ${getDefaultValue(flag.default)}` : ''
      const meta = [type, required, defaultValue].filter((item) => !!item.length).join(', ')
      const description = `${meta ? `(${meta}) ` : ''}${flag.help || flag.description || ''}`
      const width = leftColumnWidth - line.length + gutter
      const padding = width > 0 ? ' '.repeat(width) : ''
      return line + padding + this.formatDescription(description, leftColumnWidth, rightColumnWidth, gutter)
    }).join('\n')
  }

  _addFlagAlias (flag) {
    return (flag && flag.alias) ? `, -${flag.alias}` : ''
  }
}

export default ArgsAndFlags

// TODO: allow promises
function getDefaultValue (defaultValue) {
  if (!defaultValue) return

  if (typeof defaultValue === 'function') {
    return defaultValue()
  } else {
    return defaultValue
  }
}

function getAllPropertyKeyNames (option) {
  return option.alias
    ? (Array.isArray(option.alias) ? option.alias : [option.alias])
    : []
}

function getBooleans (arr) {
  return arr
    .filter((item) => { return item.type === 'boolean' })
    .map((item) => { return item.name })
}

function getStrings (arr) {
  return arr
    .filter((item) => { return item.type === 'string' })
    .map((item) => { return item.name })
}

function getAlias (arr) {
  return arr
    .filter((item) => { return item.alias })
    .reduce((obj, item) => {
      obj[item.name] = item.alias
      return obj
    }, {})
}

const minimist = require('minimist')
const isBoolean = require('is-boolean-object')
const isRegexp = require('is-regexp')
const wrap = require('word-wrap')

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
    this.minimistOptions = {}
    this.minimistOptions.boolean = getBooleans(this.flagsOptions)
    this.minimistOptions.string = getStrings(this.flagsOptions)
    this.minimistOptions.alias = getAlias(this.flagsOptions)
  }

  /**
  * Parse and validate args and flags for cli tools
  * @param {object[]} argsInput - actual args supplied at command line
  * @return {object}
  */
  parse (argsInput) {
    const minimistOutput = minimist(argsInput, this.minimistOptions)

    const minimistArgs = minimistOutput['_'].reduce((obj, arg, i) => {
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

    minimistArgs._ = minimistOutput._
    delete minimistOutput._
    const minimistFlags = minimistOutput

    checkValues(this.argsOptions, minimistArgs)
    checkValues(this.flagsOptions, minimistFlags)

    return {
      args: minimistArgs,
      flags: minimistFlags
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
  * Get help text for all args
  * @param {object} [options]
  * @param {string} [options.argsHeaderText] - header text above list of arguments. default is `Arguments`
  * @param {string} [options.flagsHeaderText] - header text above list of flags. default is `Flags`
  * @param {number} [leftColumnWidth] - width of left column in pixels. default is `40`
  * @param {number} [rightColumnWidth] - width of right column in pixels. default is `40`
  * @returns {string}
  */
  help (options) {
    options = options || {}
    let { argsHeaderText, flagsHeaderText, leftColumnWidth, rightColumnWidth } = options
    if (!leftColumnWidth) leftColumnWidth = 40
    if (!rightColumnWidth) rightColumnWidth = 40
    const args = this.argsHelp(argsHeaderText, leftColumnWidth, rightColumnWidth)
    const flags = this.flagsHelp(flagsHeaderText, leftColumnWidth, rightColumnWidth)
    return args + '\n\n' + flags
  }

  logDescription (text, leftColumnWidth, rightColumnWidth) {
    if (!text) return ''
    if (text.length > rightColumnWidth) {
      const lines = wrap(text, { width: rightColumnWidth }).split(/\r?\n/).map((line, i) => {
        if (i === 0) return line.trim()
        return ' '.repeat(leftColumnWidth) + line.trim()
      })
      return lines.join('\n')
    }
    return text
  }

  /**
  * Get help text for all args
  * @param {string} headerText - header text above list of arguments. default is `Arguments:`
  * @param {number} [leftColumnWidth] - width of left column in pixels. default is `40`
  * @param {number} [rightColumnWidth] - width of right column in pixels. default is `40`
  * @returns {string}
  */
  argsHelp (headerText, leftColumnWidth, rightColumnWidth) {
    if (!this.argsOptions.length) return ''
    if (!leftColumnWidth) leftColumnWidth = 40
    if (!rightColumnWidth) rightColumnWidth = 40
    const argumentsHeader = `${this._createIndent()}${headerText || 'Arguments:'}\n`

    return argumentsHeader + this.argsOptions.map((arg) => {
      const line = `${this._createIndent(2)}${arg.name}`
      const type = arg.type ? arg.type : ''
      const required = arg.required ? 'required' : ''
      const defaultValue = (arg.default) ? `default: ${getDefaultValue(arg.default)}` : ''
      const meta = [type, required, defaultValue].filter((item) => !!item.length).join(', ')
      const description = `${meta ? `(${meta}) ` : ''}${arg.help || arg.description || ''}`
      const width = leftColumnWidth - line.length
      const padding = ' '.repeat(width)
      return line + padding + this.logDescription(description, leftColumnWidth, rightColumnWidth)
    }).join('\n')
  }

  /**
  * Get help text for all flags
  * @param {string} headerText - header text above list of flags. default is `Flags:`
  * @param {number} [leftColumnWidth] - width of left column in pixels. default is `40`
  * @param {number} [rightColumnWidth] - width of right column in pixels. default is `40`
  * @returns {string}
  */
  flagsHelp (headerText, leftColumnWidth, rightColumnWidth) {
    if (!this.flagsOptions.length) return ''
    if (!leftColumnWidth) leftColumnWidth = 40
    if (!rightColumnWidth) rightColumnWidth = 40
    const flagsHeader = `${this._createIndent()}${headerText || 'Flags:'}\n`

    return flagsHeader + this.flagsOptions.map((flag) => {
      const line = `${this._createIndent(2)}--${flag.name}${this._addFlagAlias(flag)}    `
      const type = flag.type ? flag.type : ''
      const required = flag.required ? 'required' : ''
      const defaultValue = (flag.default) ? `default: ${getDefaultValue(flag.default)}` : ''
      const meta = [type, required, defaultValue].filter((item) => !!item.length).join(', ')
      const description = `${meta ? `(${meta}) ` : ''}${flag.help || flag.description || ''}`
      const width = leftColumnWidth - line.length
      const padding = ' '.repeat(width)
      return line + padding + this.logDescription(description, leftColumnWidth, rightColumnWidth)
    }).join('\n')
  }

  _addFlagAlias (flag) {
    return (flag && flag.alias) ? `, -${flag.alias}` : ''
  }
}

module.exports = ArgsAndFlags

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

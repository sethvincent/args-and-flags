# args-and-flags change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

- _nothing yet ..._

## [3.0.3] - 2023-02-19

### Fixed

- Fix parsing and validation of integer arguments

## [3.0.1] - 2023-02-19

### Fixed

- Cast arguments as numbers if given that type in config

## [3.0.0] - 2021-11-20

### Changed

- Switch to ES modules

## [2.3.0] - 2019-11-02

### Added

- Expose `helpObject` function to get help information for all args and flags as an object

## [2.2.2] - 2019-11-02

### Fixed

- update deps

## [2.2.1] - 2019-11-02

### Fixed

- use process.stdout.columns to improve default output spacing

## [v2.2.0] - 2019-08-11

### Added

- allow functions to return default values

## [v2.1.0] - 2018-12-26

### Added

- Expose args array as `args._`

## [v2.0.0] - 2018-10-27

### Changed

- layout is determined using `leftColumnWidth` and `rightColumnWidth` params instead of `widthPadding`.

### Added

- made small adjustment to args/flags header text and help output
- `description` is now an alias for `help` in arg/flag objects

## [v1.1.0] - 2018-10-10

### Added

- support `integer` as validation type.

## [v1.0.0] - 2018-09-15

### Added

- initial implementation

[v2.3.0]: https://github.com/sethvincent/args-and-flags/compare/v2.2.2...v2.3.0
[v2.2.2]: https://github.com/sethvincent/args-and-flags/compare/v2.2.1...v2.2.2
[v2.2.1]: https://github.com/sethvincent/args-and-flags/compare/v2.2.0...v2.2.1
[v2.2.0]: https://github.com/sethvincent/args-and-flags/compare/v2.1.0...v2.2.0
[v2.1.0]: https://github.com/sethvincent/args-and-flags/compare/v2.0.0...v2.1.0
[v2.0.0]: https://github.com/sethvincent/args-and-flags/compare/v1.1.0...v2.0.0
[v1.1.0]: https://github.com/sethvincent/args-and-flags/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/sethvincent/args-and-flags/compare/v1.0.0

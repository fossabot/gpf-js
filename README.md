# GPF Library
![GPF Logo](http://arnaudbuchholz.github.io/gpf/gpf_320x200.svg)

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[![NPM](https://nodei.co/npm/gpf-js.png?downloads=true&&downloadRank=true&stars=true)](https://nodei.co/npm/gpf-js/)
[![NPM](https://nodei.co/npm-dl/gpf-js.png?months=3&height=3)](https://nodei.co/npm/gpf-js/)

## Features

* Provides a common scripting layer for several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino),
[PhantomJS](http://phantomjs.org/), most *recent* browsers)
* Namespace and class system
* Interface based
* Asynchronous streams
* Modularization helper
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

## Metrics

This part is automatically updated upon a successful build:
* Code coverage is computed by executing [all hosts](https://arnaudbuchholz.github.io/gpf/doc/tutorial-LOADING.html),
ignored parts are [documented](https://arnaudbuchholz.github.io/gpf/doc/tutorial-COVERAGE.html)
* The [maintainability](https://arnaudbuchholz.github.io/gpf/plato/index.html) is based on
[plato evaluation](http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/maintainability-index-range-and-meaning.aspx)

**SME** stands for **s**ource **m**inimal **e**xpectation.

Metric name | average | total | SME | comment
------ | ----- | ----- | ----- | -----
Statements coverage|100%||90%|*0.64% ignored*
Branches coverage|100%||90%|*1.61% ignored*
Functions coverage|100%||90%|*1.17% ignored*
Maintainability|82.07||70|
Number of tests||669||*pending: 0, duration: 545ms*
Number of sources||90||
Lines of code|96|8652||

## Setup

* Clone repository
* install [grunt](http://gruntjs.com/)
* at the root of the cloned repository: `npm install`, then `grunt`

## Testing

See [Library testing](https://github.com/ArnaudBuchholz/gpf-js/blob/master/doc/tutorials/TESTME.md)

## Documentation

The [documentation](https://arnaudbuchholz.github.io/gpf/doc/index.html) is extracted from the sources using
[jsdoc syntax](http://usejsdoc.org/) with [grunt-jsdoc](https://github.com/krampstudio/grunt-jsdoc)
and the template from [ink-docstrap](https://www.npmjs.com/package/ink-docstrap)

## Versions

Version | Label | Release | Debug
------ | ----- | ----- | -----
[0.1.5](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.5) | The new core | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.5) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.5)
[0.1.6](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.6) | gpf.define | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.6) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.6)
[0.1.7](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.7) | Securing gpf.define | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.7) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.7)
[0.1.8](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.8) | Interfaces | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.8) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.8)
[0.1.9](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.9) | Records files | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.9) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.9)
[0.2.1](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.1) | Side project support | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.1) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.1)
[0.2.2](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.2) | gpf.require | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.2) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.2)

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from [wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Promise/A+ implementation based on [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
* [mocha](http://mochajs.org/) test suite
* [istanbul](https://github.com/gotwarlost/istanbul) code coverage tool
* JavaScript task runner: [Grunt](http://gruntjs.com/)
* Icons from [Hawcons](https://www.iconfinder.com/iconsets/hawcons)

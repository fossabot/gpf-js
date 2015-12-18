# GPF Library
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[![NPM](https://nodei.co/npm/gpf-js.png?downloads=true&&downloadRank=true&stars=true)](https://nodei.co/npm/gpf-js/)
[![NPM](https://nodei.co/npm-dl/gpf-js.png?months=3&height=3)](https://nodei.co/npm/gpf-js/)


[Plato analysis](http://arnaudbuchholz.github.io/plato/gpf-js/index.html)

## Features

* Compatible with several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino),
[PhantomJS](http://phantomjs.org/), most browsers)
* Namespace and class system
* Java-like annotation tool (attributes)
* Interface based
* Asynchronous binary / textual streams
* XML-aware
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

## Metrics

This part is automatically updated upon a successful build:
* Code coverage is based on NodeJS execution, ignored parts are mostly relevant of other hosts
* The maintainability is based on [plato evaluation](http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/
maintainability-index-range-and-meaning.aspx)


Metric name | value | comment
----- | ----- | -----
Statements coverage|99%|*10% ignored*
Branches coverage|98%|*11% ignored*
Functions coverage|99%|*15% ignored*
Average maintainability|72.84|
Number of tests|486|*pending: 2, duration: 347ms*
Number of modules|28|
Lines of Code|6690|*Average per module: 223*

## Setup

* Clone repository
* npm install at the root of the cloned repository
* ... enjoy!

## Testing

* With mocha (relative to gpf-host folder):
    * file:///./test/host/mocha/web.html
    * node ./host/mocha/nodejs.js
* Without mocha (relative to gpf-host folder):
    * file:///./test/host/web.html
    * node ./test/host/nodejs.js
    * phantomjs ./host/phantomjs.js
    * cscript /E:jscript cscript.js
    * java -jar node_modules\rhino-1_7r5-bin\rhino1_7R5\js.jar test\host\rhino.js
* With grunt:
    * testing with PhantomJS (as a browser): grunt mocha
        * grunt mocha:source
        * grunt mocha:debug
        * grunt mocha:release
    * testing with NodeJS: grunt mochaTest
        * grunt mochaTest:source
        * grunt mochaTest:debug
        * grunt mochaTest:release
    * testing with cscript:
        * grunt exec:testWScript
        * grunt exec:testWScriptVerbose
        * grunt exec:testWScriptDebug
        * grunt exec:testWScriptRelease
    * testing with rhino:
        * grunt exec:testRhino
        * grunt exec:testRhinoVerbose

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from [wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Promise/A+ implementation based on [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
* [mocha](http://mochajs.org/) test suite
* [istanbul](https://github.com/gotwarlost/istanbul) code coverage tool
* JavaScript task runner: [Grunt](http://gruntjs.com/)

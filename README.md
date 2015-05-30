# GPF Library

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[![NPM](https://nodei.co/npm/gpf-js.png?downloads=true&&downloadRank=true&stars=true)](https://nodei.co/npm/gpf-js/)
[![NPM](https://nodei.co/npm-dl/gpf-js.png?months=3&height=3)](https://nodei.co/npm/gpf-js/)


[Plato analysis](http://arnaudbuchholz.github.io/plato/gpf-js/index.html)

## Huge refactoring in progress

![Work in progress](http://arnaudbuchholz.github.io/blog/wip.png)

## Features

* Compatible with several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [PhantomJS](http://phantomjs.org/),
most browsers)
* Namespace and class system
* Java-like annotation tool (attributes)
* Interface based
* Asynchronous binary / textual streams
* XML-aware
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

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
* With grunt:
    * testing with PhantomJS (as a browser): grunt mocha
        * grunt mocha:source
        * grunt mocha:debug
        * grunt mocha:release
    * testing with NodeJS: grunt mochaTest
        * grunt mocha:source
        * grunt mocha:debug
        * grunt mocha:release
    * testing with cscript:
        * grunt exec:testWScript
        * grunt exec:testWScriptDebug
        * grunt exec:testWScriptRelease

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and
[escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from
[wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Part of the test suite based on [mocha](http://mochajs.org/)
* JavaScript task runner: [Grunt](http://gruntjs.com/)


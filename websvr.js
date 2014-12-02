/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /**
     * Process the options and dump the boot message
     *
     * @param {Object|String[]} options
     * @return {Object} The parsed options
     * @private
     */
    function _processOptions (options) {
        // Options parsing
        if (options instanceof Array) {
            options = gpf.Parameter.parse([{
                name: "port",
                type: "number",
                defaultValue: 80,
                prefix: "port"
            }, {
                name: "root",
                type: "string",
                defaultValue: ".",
                prefix: "root"
            }, {
                name: "chunkSize",
                type: "number",
                defaultValue: 4096,
                prefix: "chunk"
            }, gpf.Parameter.VERBOSE, gpf.Parameter.HELP], options);
        }
        // Server boot trace
        console.log("GPF " + gpf.version() + " web server");
        if (options.root === ".") {
            options.root = process.cwd();
        }
        if (options.verbose) {
            console.log("root: " + options.root);
            console.log("port: " + options.port);
        }
        return options;
    }

    var
        /**
         * Placeholder class to extend the NodeJS response class and provide
         * more context to it
         *
         * @class ResponseHandler
         * @private
         */
        ResponseHandler = gpf.define("ResponseHandler", {

            private: {

                /**
                 * Web server options
                 *
                 * @type {Object}
                 * @private
                 */
                _options: null,

                /**
                 * Request
                 *
                 * @type {NodeJS.http.IncomingMessage}
                 * @private
                 */
                _request: null,

                /**
                 * Response
                 *
                 * @type {NodeJS.http.ServerResponse}
                 * @private
                 */
                _response: null,

                /**
                 * Parsed URL object (see NodeJS url.parse documentation)
                 *
                 * @type {Object}
                 * @private
                 */
                _parsedUrl: null,

                /**
                 * Corresponding file path
                 *
                 * @type {String}
                 * @private
                 */
                _filePath: "",

                /**
                 * File extension (lowercase)
                 *
                 * @type {String}
                 * @private
                 */
                _extName: ""

            },

            public: {

                /**
                 * @param {Object} options Web server options
                 * @param {NodeJS.http.IncomingMessage} request
                 * @param {NodeJS.http.ServerResponse} response
                 * @constructor
                 */
                constructor: function (options, request, response) {
                    var
                        url = require("url"),
                        path = require("path");
                    this._options = options;
                    this._request = request;
                    this._response = response;
                    // Parse and analyse URL
                    this._parsedUrl = url.parse(request.url);
                    this._filePath = path.join(
                        this._options.root,
                        this._parsedUrl.pathname
                    );
                    this._extName = path.extname(this._filePath).toLowerCase();
                    // Extend response
                    response._gpf = this;
                    response.plain = ResponseHandler._plain;
                },

                /**
                 * Process the request
                 */
                process: function () {
                    var fs = require("fs");
                    if (fs.existsSync(this._filePath)) {
                        if (".jsp" === this._extName) {
                            this.plain(500, "JSP not handled yet");
                        } else {
                            this.plain(200, "File exists");
                        }
                    } else {
                        this.plain(404, "No file found");
                    }
                },

                /**
                 * Generates a PLAIN response to the server
                 *
                 * @param {Number} statusCode
                 * @param {String} text
                 */
                plain: function (statusCode, text) {
                    var resp = this._response;
                    resp.writeHead(statusCode, {"Content-Type": "text/plain"});
                    resp.write([
                        "port    : " + this._options.port,
                        "method  : " + this._request.method,
                        "url     : " + this._request.url,
                        "root    : " + this._options.root,
                        "path    : " + this._filePath,
                        "headers : "
                        + JSON.stringify(this._request.headers, null, "\t\t"),
                        text
                    ].join("\n"));
                    resp.end();
                },

                /**
                 * Generates a response that contains the specified file
                 *
                 * @param {String} filePath
                 * @private
                 */
                fromFile: function (filePath) {
                    var
                        me = this,
                        fs = require("fs"),
                        path = require("path"),
                        extName = path.extname(filePath).toLowerCase(),
                        chunkSize = me._options.chunkSize,
                        buffer,
                        pos = 0,
                        len,
                        fileDescriptor,
                        read,
                        write;
                    read = function () {
                        fs.read(fileDescriptor, buffer, pos, chunkSize, null,
                            write);
                    };
                    write = function (err, bytesRead, buffer) {

                    };
                    fs.stat(filePath, function (err, stats) {
                        if (err) {
                            me._response.plain(500,
                                "Unable to access file (" + err + ")");
                            return;
                        }
                        len = stats.size;
                        gpf.http.getMimeType(extName, function (event) {
                            me._response.writeHead(200, {
                                "Content-Type": event.get("mimeType"),
                                "Content-Length": len
                            });
                            fs.open(filePath, "r", function (err, fd) {
                                if (err) {
                                    me._response.plain(500,
                                        "Unable to open file (" + err + ")");
                                    return;
                                }
                                fileDescriptor = fd;
                                buffer = new Buffer(me._options.chunkSize);
                                read();
                            });
                        });
                    });
                }

            },

            static: {

                /**
                 * Generates a PLAIN response to the server
                 *
                 * @param {Number} statusCode
                 * @param {String} text
                 * @private
                 */
                _plain: function (statusCode, text) {
                    return this._gpf.plain(statusCode, text);
                },

                /**
                 * Generates a response that contains the specified file
                 *
                 * @param {String} filePath
                 * @private
                 */
                _fromFile: function (filePath) {
                    return this._gpf.fromFile(filePath);
                }

            }
        });


    /**
     * Run the GPF web server
     *
     * @param {String[]|Object|undefined} options
     */
    gpf.runWebServer = function (options) {
        options = _processOptions(options);
        // Expose ExtJS require
        global.require = require;
        // Build the web server
        require("http").createServer(function (request, response) {
            if (options.verbose) {
                console.log([
                    request.method,
                    "     ".substr(request.method.length),
                    request.url
                ].join(""));
            }
            var handler = new ResponseHandler(options, request, response);
            handler.process();
        }).on("close", function () {
            console.log("Closed.");
        }).listen(options.port);
        if (options.verbose) {
            console.log("Listening... (CTRL+C to stop)");
        }
    };

    /**
     * Detect if the library was run as a standalone file, in that case, run
     * the web server.
     */
    (function () {
        var
            path,
            scriptName;
        if ("nodejs" !== gpf.host()) {
            return; // Not inside nodejs
        }
        path = require("path");
        scriptName = path.basename(process.argv[1], ".js");
        if (scriptName === "boot"
            || scriptName === "gpf"
            || scriptName === "gpf-debug") {
            gpf.runWebServer(process.argv.slice(2));
        } else {
            console.log(scriptName);
        }
    }());

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/

(function () { /* Begin of privacy scope */
    "use strict";
    /*global esprima, escodegen*/

    var
        gpfX = gpf.xml,
        versions = {
            debug: {
                UMD: true,
                DEBUG: true,
                keepComments: true,
                rewriteOptions: {
                    format: {
                        indent: {
                            style: "    ",
                            base: 0,
                            adjustMultilineComment: false
                        },
                        newline: "\n",
                        space: " ",
                        json: false,
                        renumber: false,
                        hexadecimal: false,
                        quotes: "double",
                        escapeless: false,
                        compact: false,
                        parentheses: true,
                        semicolons: true,
                        safeConcatenation: false
                    },
                    comment: true
                }
            },
            release: {
                UMD: true,
                DEBUG: false,
                keepComments: false,
                rewriteOptions: {
                    format: {
                        indent: {
                            style: " ",
                            base: 0,
                            adjustMultilineComment: false
                        },
                        newline: "\n",
                        space: " ",
                        json: false,
                        renumber: false,
                        hexadecimal: false,
                        quotes: "double",
                        escapeless: false,
                        compact: true,
                        parentheses: false,
                        semicolons: true,
                        safeConcatenation: true
                    },
                    comment: false
                }
            }
        },
        // body/item[@type="ExpressionStatement" and expression/@name="__gpf__"]
        xpathToGpfPlaceHolder = new gpfX.XPath({
            type: gpfX.NODE_ELEMENT,
            name: "body",
            relative: false,
            then: {
                type: gpfX.NODE_ELEMENT,
                name: "item",
                filter: {
                    and: [ {
                        type: gpfX.NODE_ATTRIBUTE,
                        name: "type",
                        text: "ExpressionStatement"
                    }, {
                        type: gpfX.NODE_ELEMENT,
                        name: "expression",
                        then: {
                            type: gpfX.NODE_ATTRIBUTE,
                            name: "name",
                            text: "__gpf__"
                        }
                    }]
                }
            }
        })
    ;

    function preProcess(src, version) {
        var
            lines = src.split("\n"),
            len = lines.length,
            idx,
            line,
            ignoreStack = [false],
            ignore;
        for (idx = 0; idx < len; ++idx) {
            line = lines[idx];
            ignore = ignoreStack[ignoreStack.length - 1];
            if (-1 < line.indexOf("/*#if")) {
// console.log("#" + line);
                // In the end, we use an "ignore" flag
                // so we invert the condition
                ignore = -1 === line.indexOf("/*#ifndef(");
                line = line.split("(")[1].split(")")[0];
// console.log("\t" + line);
                ignore = gpf.xor(version[line], ignore);
// console.log("\t" + ignore);
                ignoreStack.push(ignore);
                ignore = true; // Ignore this line
// console.log(">>" + ignoreStack);
                /*
                 * TODO handle imbricated when the parent is false
                 */

            } else if (-1 < line.indexOf("/*#else")) {
                ignoreStack[ignoreStack.length - 1] = !ignore;
                ignore = true; // Ignore this line

            } else if (-1 < line.indexOf("/*#endif")) {
// console.log("#" + line);
                ignoreStack.pop();
                ignore = true; // Ignore this line
// console.log(">>" + ignoreStack);
            }
// console.log((ignore ? "-" : "+")  + line);
            if (ignore) {
                lines.splice(idx, 1);
                --len;
                --idx;
            }
        }
        return lines.join("\n");
    }

    function toAST(src, version) {
        // https://github.com/Constellation/escodegen/issues/85
        var
            keepComments = version.keepComments,
            ast = esprima.parse(src, {
                range: keepComments,
                tokens: keepComments,
                comment: keepComments
            });
        if (keepComments) {
            ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
            delete ast.tokens;
            delete ast.comments;
        }
        return ast;
    }

    function pushCloneOf(idx, item) {
        /*jslint -W040*/
        gpf.interfaces.ignoreParameter(idx);
        this.push(gpf.clone(item));
        /*jslint +W040*/
    }

    gpf.context().make = function(sources, version) {
        var
            parsed,
            __gpf__,
            placeholder,
            idx,
            source,
            body;
        if (undefined === versions[version]) {
            throw {
                message: "Unknown version"
            };
        }
        parsed = sources[version];
        if (undefined !== parsed) {
            return parsed.gpf;
        }
        parsed = sources[version] = {};
        version = versions[version];
        // First, parse everything
        parsed["UMD.js"] = preProcess(sources.UMD, version);
        parsed.UMD = toAST(parsed["UMD.js"], version);
        parsed.result = gpf.clone(parsed.UMD);
        parsed["boot.js"] = preProcess(sources.boot, version);
        parsed.boot = toAST(parsed["boot.js"], version);
        for (idx = 0; idx < sources._list.length; ++idx) {
            source = sources._list[idx];
            parsed[source + ".js"] = preProcess(sources[source], version);
            parsed[source] = toAST(parsed[source + ".js"], version);
        }
        // Then, locate the use of __gpf__ to replace it with our content
        __gpf__ = xpathToGpfPlaceHolder
            .selectNodes(new gpfX.ConstNode(parsed.result))[0];
        // Parent is the placeholder (an array ending with __gpf__)
        placeholder = __gpf__.parentNode().nodeValue();
        placeholder.pop(); // remove __gpf__
        // Add all sources
        for (idx = -1; idx < sources._list.length; ++idx) {
            if (-1 === idx) {
                source = "boot";
            } else {
                source = sources._list[idx];
            }
            try {
                body = parsed[source].body;
            } catch(e) {
                console.error("Error while processing source: " + source
                    + "\r\n" + e.message);
            }
            if (body instanceof Array) {
// console.log("Adding " + body.length + " items from " + source);
                gpf.each.apply(placeholder, [body, pushCloneOf]);
            } else {
// console.log("Adding item from " + source + "\r\n" + body.item);
                placeholder.push(gpf.clone(body));
            }
        }
        // And generate the result
        parsed["result.js"] = escodegen.generate(parsed.result,
            version.rewriteOptions);

        return parsed["result.js"];
    };

}()); /* End of privacy scope */

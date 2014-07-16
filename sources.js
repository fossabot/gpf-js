(function () { /* Begin of privacy scope */
    "use strict";

    var
        _sources = [
            "base",                 // Basic functions
            "events",               // Event management               gpf.events
            "http",                 // HTTP specific functions          gpf.http
            "async",                // Asynchronous handling           gpf.defer
            "bin",                  // Binary tools                      gpf.bin
            "json",                 // JSON compatibility layer         gpf.json
            "class",                // Class
            "attributes",           // Attributes                 gpf.attributes
            "error",                // Error base class
            "att_class",            // Class attributes
            "interface",            // Interface                  gpf.interfaces
            "i_enumerable",         // IEnumerable
            "i_array",              // IArray
            "i_stream",             // ITextStream
            "string",               // String functions
            "date",                 // Date functions

            "parser",               // Parser helper                  gpf.Parser
            "tokenizer",            // Javascript parser                  gpf.js

            "html",                 // HTML specific functions          gpf.html

            "xml",                  // Xml serializer & attributes       gpf.xml
            "xnode",                // Xml 'DOM' structure               gpf.xml
            "xpath"                 // Xml 'XPATH' parser/evaluator      gpf.xml
        ];

    gpf.sources = function () {
        return _sources.join(",");
    };

}()); /* End of privacy scope */

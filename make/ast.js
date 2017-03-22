"use strict";

const
    fs = require("fs"),
    esprima = require("esprima"),
    escodegen = require("escodegen"),
    identifierCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    jsKeywords = fs.readFileSync("../res/javascript.keywords.txt").toString().split("\n"),

    // Test if the AST item has the request gpf: tag
    isTaggedWithGpf = (ast, tag) => ast.leadingComments
        ? ast.leadingComments.some(comment => comment.value === `gpf:${tag}`)
        : false,

    reducers = {

        VariableDeclaration: {

            // TODO distinguish 'globals' from inner variables
            pre: (ast, reducer) => reducer.beginIdentifierMapping(ast.declarations
                        .filter(decl => !isTaggedWithGpf(decl, "no-reduce"))
                        .map(decl => decl.id.name), true)

        },

        FunctionDeclaration: {

            // Names are reduced at an higher level
            pre: (ast, reducer) => Array.isArray(ast.params)
                ? reducer.beginIdentifierMapping(ast.params
                    .filter(param => !isTaggedWithGpf(param, "no-reduce"))
                    .map(param => param.name), false)
                : 0,

            // Clean parameters (and inner variables) substitutions
            post: (reducer/*, ast*/) => reducer.endIdentifierMapping()

        },

        FunctionExpression: {

            // Process parameters
            pre: (ast, reducer) => Array.isArray(ast.params)
                ? reducer.beginIdentifierMapping(ast.params
                    .filter(param => !isTaggedWithGpf(param, "no-reduce"))
                    .map(param => param.name), false)
                : 0,

            // Clean parameters (and inner variables) substitutions
            post: (reducer/*, ast*/) => reducer.endIdentifierMapping()

        },

        Identifier: {

            // TODO Check the astParent avoid !MemberExpression.property
            pre: (astItem, reducer) => {
                let newName = reducer.isIdentifierMapped(astItem.name);
                if (undefined !== newName) {
                    astItem.name = newName;
                }
            }

        },

        MemberExpression: {

            walk: (astItem, reducer) => {
                reducer.reduce(astItem.object);
                // Reduce property only if computed
                if (astItem.computed) {
                    reducer.reduce(astItem.property);
                }
            }

        },

        ObjectExpression: {

            walk: (astItem, reducer) => astItem.properties.forEach(property => reducer.reduce(property.value))

        }
    };

class ASTreducer {

    constructor () {
        // Dictionary of name to mapped identifiers (Array)
        this._identifiers = {}; // NOTE key is escaped to avoid collision with existing members

        // Number of identifiers mapped
        this._identifierCount = 0;

        // Stack of name arrays (corresponding to the cumulated calls to beginIdentifierMapping)
        this._identifiersStack = [];
    }

    // Process the AST to reduce the generated source
    reduce (ast) {
        this._walk(ast);
    }

    // Create new variable names for the provided name list (forVariables is used to distinguish function names)
    beginIdentifierMapping (names, forVariables) {
        names.isVariables = forVariables;
        names.identifierCount = this._identifierCount;
        this._identifiersStack.push(names);
        names.forEach(name => {
            name = " " + name;
            let newNames = this._identifiers[name];
            if (undefined === newNames) {
                newNames = this._identifiers[name] = [];
            }
            newNames.unshift(this._newName());
        }, this);
    }

    // Roll back new variable names created with beginIdentifierMapping
    endIdentifierMapping () {
        // Undo identifiers stack until a non 'isVariables' one is found
        let stack = this._identifiersStack,
            names;
        do {
            names = stack.pop();
            names.forEach(name => {
                name = " " + name;
                let newNames = this._identifiers[name];
                if (newNames.length === 1) {
                    delete this._identifiers[name];
                } else {
                    newNames.shift();
                }
            });
            this._identifierCount = names.identifierCount;
        } while (names.isVariables);
    }

    // Return the mapped identifier (if any)
    isIdentifierMapped (name) {
        name = " " + name;
        if (this._identifiers.hasOwnProperty(name)) {
            return this._identifiers[name][0];
        }
    }

    // Explore the AST array and apply the necessary transformations
    _walkArray (astArray) {
        // First pass to see if any FunctionDeclaration names
        let names = astArray
            .filter(astItem => astItem.type === "FunctionDeclaration")
            .map(astItem => astItem.id.name);
        this.beginIdentifierMapping(names, true);
        // Second pass to reduce
        astArray.forEach(astItem => this._walk(astItem));
    }

    // Explore the AST members and apply the necessary transformations
    _walkItem (ast) {
        Object.keys(ast).forEach(member => {
            let astMember = ast[member];
            if ("object" === typeof astMember && astMember) {
                this._walk(astMember);
            }
        });
    }

    // Apply AST reducer to reduce it
    _reduce (ast) {
        let processor = reducers[ast.type] || {};
        if (processor.pre) {
            processor.pre(ast, this);
        }
        if (processor.walk) {
            processor.walk(ast, this);
        } else {
            this._walkItem(ast);
        }
        if (processor.post) {
            processor.post(this, ast);
        }
    }

    /* Explore the AST structure and apply the necessary transformations.
     * The transformations are based on processors declared as static members of this class.
     * Each processor is matched using the AST type and it may contain:
     * - pre: function to apply before exploring the AST
     * - post: function to apply after exploring the AST
     * - walk: override the AST exploring
     */
    _walk (ast) {
        if (ast instanceof Array) {
            this._walkArray(ast);
        } else {
            this._reduce(ast);
        }
    }

    // New name allocator (based on number of identifiers)
    _newName () {
        let id,
            newName,
            mod = identifierCharacters.length;
        do {
            id = this._identifierCount++;
            newName = [];
            while (id >= identifierCharacters.length) {
                newName.push(identifierCharacters.charAt(id % mod));
                id /= mod;
            }
            newName.push(identifierCharacters.charAt(id));
            newName = newName.join("");
        } while (-1 < jsKeywords.indexOf(newName));
        return newName;
    }

}

module.exports = {

    // Transform the source into an AST representation
    transform: function (src) {
        // https://github.com/Constellation/escodegen/issues/85
        let ast = esprima.parse(src, {
            range: true,
            tokens: true,
            comment: true
        });
        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
        delete ast.tokens;
        delete ast.comments;
        return ast;
    },

    // Apply the reduction algorithm
    reduce: function (ast) {
        var reducer = new ASTreducer();
        reducer.reduce({}); // disabled for now
        return ast;
    },

    // Generate source code from the AST
    rewrite: function (ast, options) {
        return escodegen.generate(ast, options);
    }

};

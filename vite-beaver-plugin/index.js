"use strict";
exports.__esModule = true;
var fileRegex = /\.(ts)$/;
var Parser_1 = require("htmlparser2/lib/Parser");
var domhandler_1 = require("domhandler");
function phenomenJSX() {
    return {
        name: 'phenomenJSX',
        enforce: 'pre',
        transform: function (src, id) {
            if (fileRegex.test(id)) {
                var match = void 0;
                var patt = /([`])(?:(?=(\\?))\2.)*?\1/gs;
                while ((match = patt.exec(src))) {
                    if (src.slice(match.index - 4, match.index) === 'html') {
                        var startIndex = match.index + 1;
                        var endIndex = patt.lastIndex - 1;
                        var handler = new domhandler_1.DomHandler();
                        new Parser_1.Parser(handler, {
                            lowerCaseAttributeNames: false,
                            lowerCaseTags: false
                        }).end(src.slice(startIndex, endIndex));
                        var root = handler.root;
                        var cache = [];
                        src =
                            src.slice(0, startIndex - 5) +
                                JSON.stringify(root, function (key, value) {
                                    if (typeof value === 'object' && value !== null) {
                                        if (key === 'next' || key === 'prev')
                                            return;
                                        // Duplicate reference found, discard key
                                        //@ts-ignore
                                        if (cache.includes(value))
                                            return;
                                        // Store value in our collection
                                        cache.push(value);
                                    }
                                    return value;
                                }) +
                                src.slice(endIndex + 1);
                        cache = null;
                    }
                    else {
                    }
                }
                return {
                    code: src,
                    map: null
                };
            }
        }
    };
}
exports["default"] = phenomenJSX;

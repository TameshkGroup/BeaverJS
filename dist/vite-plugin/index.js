var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "htmlparser2/lib/Parser", "domhandler", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fileRegex = /\.(ts)$/;
    const Parser_1 = require("htmlparser2/lib/Parser");
    const domhandler_1 = require("domhandler");
    const ts = __importStar(require("typescript"));
    const typescript_1 = require("typescript");
    function phenomenJSX() {
        return {
            name: 'phenomenJSX',
            enforce: 'pre',
            transform(src, id) {
                //console.log(id, args, server)
                if (fileRegex.test(id)) {
                    let match;
                    const patt = /([`])(?:(?=(\\?))\2.)*?\1/gs;
                    while ((match = patt.exec(src))) {
                        if (src.slice(match.index - 4, match.index) === 'html') {
                            const startIndex = match.index + 1;
                            const endIndex = patt.lastIndex - 1;
                            let handler = new domhandler_1.DomHandler();
                            new Parser_1.Parser(handler, {
                                lowerCaseAttributeNames: false,
                                lowerCaseTags: false,
                            }).end(src.slice(startIndex, endIndex));
                            const root = handler.root;
                            let cache = [];
                            src =
                                src.slice(0, startIndex - 5) +
                                    JSON.stringify(root, (key, value) => {
                                        if (typeof value === 'object' && value !== null) {
                                            if (key === 'next' || key === 'prev')
                                                return;
                                            // Duplicate reference found, discard key
                                            //@ts-ignore
                                            if (cache.includes(value))
                                                return;
                                            // Store value in our collection
                                            cache?.push(value);
                                        }
                                        return value;
                                    }) +
                                    src.slice(endIndex + 1);
                            cache = null;
                        }
                        else {
                        }
                    }
                    const node = ts.createSourceFile(id, src, ts.ScriptTarget.Latest);
                    const importMap = node.statements
                        .filter((statement) => statement.kind === typescript_1.SyntaxKind.ImportDeclaration)
                        .map((statement) => 
                    //@ts-ignore
                    (statement.importClause.name?.escapedText
                        ? //@ts-ignore
                            [statement.importClause.name?.escapedText]
                        : //@ts-ignore
                            statement.importClause.namedBindings.elements.map(
                            //@ts-ignore
                            (elem) => elem.name?.escapedText))
                        //@ts-ignore
                        .map((item) => ({ [item]: statement.moduleSpecifier.text })))
                        .flat()
                        .reduce((obj, item) => ({ ...obj, ...item }), {});
                    src = src.replace(/\$\$elements( )*(:(.|\n)+)?( )*=( )*\{\s*(((([A-z]|_)+([A-z]|_|\d)*)\s*,\s*)*(([A-z]|_)+([A-z]|_|\d)*))\s*\}/gm, (a) => {
                        console.log('e');
                        const els = /{\s*(?<all>(((([A-z]|_)+([A-z]|_|\d)*))\s*,\s*)*(([A-z]|_)+([A-z]|_|\d)*))\s*\}/gm
                            .exec(a)
                            ?.groups?.all.split(', ');
                        const elsImports = els?.map((e) => importMap[e.trim()]);
                        //console.log({ els })
                        return `\n 
                        constructor(){
                            super()
                            if(import.meta.hot){    
                                import.meta.hot.accept(${JSON.stringify(elsImports)},(modules) => {
                                    //console.log('modules', modules)
                                    //let changedEls = Object.entries(this.$$elementInstances).filter( ([elKey,e]) => Object.entries(this.$$elements).reduce((acm, [k,m], index)=> {console.log('insideReduce', k,m, acm, modules, index , (e instanceof m)); return acm || (modules[index] && (e instanceof m))},false))
                                    //console.log('changed-els', changedEls);
                                    //let data = Object.fromEntries(changedEls.map(([k, e]) => { return [k, Object.fromEntries(Object.entries(e).filter(([k,v])=> k.indexOf('$$subscribes') === 0 || k.indexOf('$$') !== 0 && k.indexOf('props') !== 0))]}))
                                    //console.log('hmr-data', data);
                                    this.$$elements = Object.fromEntries(
                                        ${JSON.stringify(els)}
                                        .map((elKey, index)=> [elKey,modules[index] ? modules[index].default:this.$$elements[elKey]])
                                    );
                                    const updatedElementNames =
                                        ${JSON.stringify(els)}
                                        .filter((elKey, index)=> !!modules[index])
                                        .map((k)=> k)
                                
                                    //this.$$rootElement.innerHTML = '';
                                    console.log('rerender', this.$$elementInstances, updatedElementNames);
                                    Object.entries(this.$$elementInstances).filter(([k,$el])=> { console.log($el);return updatedElementNames.includes($el.$$elementName)}).forEach(([k,v])=>{ // TOOD Should recursively do this
                                        console.log('reloading', v, this.$$elements[v.$$elementName].$$template);
                                        const newInst = (new this.$$elements[v.$$elementName]);
                                        console.log('newInstant', newInst);
                                        Object.entries(newInst).forEach(([propName, prop])=>{
                                            if(typeof prop === 'function' || propName === '$$elements')
                                                v[propName] = prop;
                                        })
                                        v.$$template = newInst.$$template
                                        v.template = newInst.template.bind(v)
                                        v.$$rootElement.innerHTML = '';
                                        v.reRender();
                                    })
                                    //this.reRender();
                                    //Object.values(this.$$elementInstances).filter((e)=> data[e.$id]).forEach((e)=> Object.entries(data[e.$id]).forEach(([k,v])=> {console.log(e.$id, 'setting', k, v, e[k]);if(k!== '$id'){e[k] = v}} ))
                                })
                            }
                        } \n ${a}`;
                    });
                    //}
                    try {
                        /* recast.parse(src, {
                            parser: typescript,
                        }) */
                    }
                    catch (e) {
                        console.error(e);
                    }
                    //this.parse(src, { })
                    //return src
                    return {
                        code: src,
                    };
                }
                else {
                    return {
                        code: src,
                    };
                }
            },
        };
    }
    exports.default = phenomenJSX;
});
//# sourceMappingURL=index.js.map
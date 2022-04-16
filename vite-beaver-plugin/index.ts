const fileRegex = /\.(ts)$/
import * as _ from 'lodash'

import { Parser } from 'htmlparser2/lib/Parser'
import { DomHandler as Handler } from 'domhandler'
import {} from 'vite'

export default function phenomenJSX() {
    let config
    let server
    return {
        name: 'phenomenJSX',
        enforce: 'pre',
        configResolved(resolvedConfig) {
            // store the resolved config
            config = resolvedConfig
        },
        configureServer(_server) {
            server = _server
        },
        moduleParsed(...args) {
            console.log('args', args)
        },
        resolveFileUrl(...args) {
            console.log('rfu', args)
        },
        load(...args) {
            //console.log('load', args)
        },
        buildStart(...args) {
            //console.log('bs', args)
        },
        resolveId(...args) {
            //console.log('resolveId', args)
            console.log('mInfo', args[0], this.getModuleInfo(args[0]))
        },
        resolveDynamicImport(...args) {
            console.log('di', ...args)
        },
        renderStart(...args) {
            console.log('rs', args)
        },
        transform(src: string, id, ...args) {
            //console.log(id, args, server)
            const mIds = this.getModuleIds()
            console.log(
                'mInfo',
                id,
                //@ts-ignore
                Array.from(mIds).find((mId: string) => {
                    //console.log(mId)
                    id.indexOf(mId.replace('./', '').replace('../', '')) >= 0
                })
            )

            if (fileRegex.test(id)) {
                let match
                const patt = /([`])(?:(?=(\\?))\2.)*?\1/gs
                while ((match = patt.exec(src))) {
                    if (src.slice(match.index - 4, match.index) === 'html') {
                        const startIndex = match.index + 1
                        const endIndex = patt.lastIndex - 1
                        let handler = new Handler()

                        new Parser(handler, {
                            lowerCaseAttributeNames: false,
                            lowerCaseTags: false,
                        }).end(src.slice(startIndex, endIndex))
                        const root = handler.root
                        var cache = []
                        src =
                            src.slice(0, startIndex - 5) +
                            JSON.stringify(root, (key, value) => {
                                if (typeof value === 'object' && value !== null) {
                                    if (key === 'next' || key === 'prev') return
                                    // Duplicate reference found, discard key
                                    //@ts-ignore
                                    if (cache.includes(value)) return

                                    // Store value in our collection
                                    cache.push(value)
                                }
                                return value
                            }) +
                            src.slice(endIndex + 1)
                        cache = null
                    } else {
                    }
                }

                src = src.replace(
                    /\$\$elements(:(.|\n)*)=( )*\{\s*(((([A-z]|_)+([A-z]|_|\d)*)\s*,\s*)*(([A-z]|_)+([A-z]|_|\d)*))\s*\}/g,
                    (a) => {
                        const els =
                            /{\s*(?<all>(((([A-z]|_)+([A-z]|_|\d)*))\s*,\s*)*(([A-z]|_)+([A-z]|_|\d)*))\s*\}/g
                                .exec(a)
                                .groups.all.split(', ')
                                .map((e) => e.trim())

                        //console.log({ els })

                        return `\n 
                        constructor(){
                            super()
                            if(import.meta.hot){    
                                import.meta.hot.accept(${JSON.stringify(els)}, (modules) => {
                                    console.log('modules', modules)
                                    this.$$elements = Object.fromEntries(${JSON.stringify(
                                        els
                                    )}.map((elKey, index)=> [elKey,modules[index]?modules[index].default:this.$$elements[elKey]]))
                                    this.$$rootElement.innerHTML = ''
                                    this.render()
                                })
                            }
                        } \n ${a}`
                    }
                )

                return {
                    code: src,
                    map: null, // provide source map if available
                }
            }
        },
    }
}

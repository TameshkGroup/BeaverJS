const fileRegex = /\.(ts)$/
import _ from 'lodash'

import { Parser } from 'htmlparser2/lib/Parser'
import { DomHandler as Handler } from 'domhandler'

export default function phenomenJSX() {
    return {
        name: 'phenomenJSX',
        enforce: 'pre',
        transform(src: string, id) {
            if (fileRegex.test(id)) {
                let match
                const patt = /([`])(?:(?=(\\?))\2.)*?\1/gs
                while ((match = patt.exec(src))) {
                    if (src.slice(match.index - 4, match.index) === 'html') {
                        const startIndex = match.index + 1
                        const endIndex = patt.lastIndex - 1
                        let handler = new Handler();                        
                        
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

                return {
                    code: src,
                    map: null, // provide source map if available
                }
            }
        },
    }
}

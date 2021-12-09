const fileRegex = /\.(ts)$/
import HTMLParser from 'fast-html-parser'

import * as ts from 'typescript'

function tsCompile(
    source: string,
    options: ts.TranspileOptions = null
): string {
    // Default options -- you could also perform a merge, or use the project tsconfig.json
    if (null === options) {
        options = { compilerOptions: { module: ts.ModuleKind.CommonJS } }
    }
    return ts.transpileModule(source, options).outputText
}

export default function phenomenJSX() {

    return {
        name: 'phenomenJSX',
        enforce: 'pre',
        transform(src: string, id) {
            if (fileRegex.test(id)) {
                console.log('phenomenJSX', id)
                const t1 = performance.now()
                console.log('start', t1)
                const chars = []

                for (let i = 0; i < src.length; i++) {
                    const c = src.charAt(i)
                    if (c === '`') {
                        chars.push(c)
                        //console.log('found', c)
                    }
                }

                console.log('chars', chars)

                const t2 = performance.now()
                console.log('end', t2 - t1)

                const chars2 = []

                let match
                const patt = /([`])(?:(?=(\\?))\2.)*?\1/gs
                while ((match = patt.exec(src))) {
                    if (src.slice(match.index - 4, match.index) === 'HTML') {
                        console.log('isHTML')
                        const startIndex = match.index + 1
                        const endIndex = patt.lastIndex - 1

                        const root = HTMLParser.parse(
                            src.slice(startIndex, endIndex)
                        )

                        const parse = (
                            node: HTMLParser.HTMLElement,
                            path: number[] = []
                        ) => {
                            console.log('node', node, node.rawText)
                            node.childNodes?.forEach((childNode, index) => {
                                parse(childNode, [...path, index])
                            })
                        }

                        parse(root)

                        src =
                            src.slice(0, startIndex - 5) +
                            JSON.stringify(root) +
                            src.slice(endIndex + 1)
                    } else {
                        console.log('isNotHTML')
                    }
                    console.log(
                        match.index + ' ' + patt.lastIndex,
                        src.slice(match.index + 1, patt.lastIndex - 1)
                    )
                }

                // console.log(
                //     [...src.matchAll(/([`])(?:(?=(\\?))\2.)*?\1/gs)].map(
                //         (i) => [i.index, i.groups]
                //     )
                // )
                // src.match(/`/g).forEach((char) => {
                //     //console.log('found2', char)
                //     chars2.push(char)
                // })

                console.log('chars2', chars2)

                console.log('end3', performance.now() - t2)

                // const src2 = src.replace(/HTML`((?!`).)*`/gs, (template) => {
                //     console.log('template', id, template)
                //     return '[]'
                // })

                console.log('code is', src)

                return {
                    code: src,
                    map: null, // provide source map if available
                }
            }
        },
    }
}

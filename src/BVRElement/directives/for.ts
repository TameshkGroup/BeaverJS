import { Element } from 'domhandler/lib'
import { nanoid } from 'nanoid'
import BVRElement, { appendElFromTemplate } from '..'
/* import * as ts from 'typescript'
 */
export default class ForDirective {
    constructor(private bvrElement: BVRElement) {}

    static tagName = 'for'

    render(templateEl: Element, scope: any, parentScopeId: string) {
        const tEl = templateEl as Element
        let element: (HTMLElement | Comment)[] = []

        /* TODO Method of detect variables not work as expected */
        const vars = [
            ...(tEl.attribs['exp']
                .match(/(let|const|var)( |	|\n)+([A-z]|\$|_)+/g)
                ?.map((v) => v.replace(/(let|const|var)( |	|\n)/g, '')) || []),
            ...Object.keys(scope),
        ]?.join(',')
        /*  const node = ts.createSourceFile('', tEl.attribs['exp'], ts.ScriptTarget.Latest)
        const vars: string[] = []
        node.forEachChild((child) => {
            if (ts.isVariableDeclaration(child)) {
                vars.push(child.getFullText())
            }
        }) */

        //v.match(/(?<=this\.)(([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g)?.forEach((item) => {

        const exp = tEl.attribs['exp'].replaceAll(
            /((this\.))(?=([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g,
            'that.'
        )
        tEl.attribs['exp']
            .match(/this\.(([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g)
            ?.forEach(($var) => {
                //const propTrimmed = $propStr.replace('this.', '')
                this.bvrElement.addSubscribe($var.substring(5), () => set(), parentScopeId)
            })
        const code = `
                    var that = this;
                    const {${Object.keys(scope).join(',')}} = ${JSON.stringify(scope)}
                    const elements = []
                    for( ${exp} ){
                        elements.push(...tEl.children.map((tChild)=>{
                            return appendElFromTemplate(those, tChild, elem, {${vars}}, scopeId)
                        }))
                    }
                    return elements;
                    `

        const args = ['appendElFromTemplate,those,tEl,elem,scopeId', code]

        let lastId: string | undefined
        const set = () => {
            if (lastId) {
                this.bvrElement.removeSubscribeByClass(lastId)
            }

            function getComments(context: HTMLElement) {
                var foundComments: Comment[] = []
                var elementPath: (ChildNode | undefined)[] = [context]
                while (elementPath.length > 0) {
                    var el = elementPath.pop()
                    for (var i = 0; i < (el?.childNodes.length || 0); i++) {
                        var node = el?.childNodes[i]
                        if (node?.nodeType === Node.COMMENT_NODE && node instanceof Comment) {
                            foundComments.push(node)
                        } else {
                            elementPath.push(node)
                        }
                    }
                }

                return foundComments
            }

            let start: Comment | undefined
            let end: Comment | undefined

            const $scopeId = nanoid(6)
            let first = false
            if (!lastId) {
                first = true
                lastId = $scopeId
                start = document.createComment('for:' + $scopeId)
                end = document.createComment('endfor:' + $scopeId)
                element = [start, end]
            } else {
                start = getComments(this.bvrElement.$$rootElement).find(
                    (cmnt) => cmnt.nodeValue === 'for:' + lastId
                )
                end = getComments(this.bvrElement.$$rootElement).find(
                    (cmnt) => cmnt.nodeValue === 'endfor:' + lastId
                )
                //let cursor = start?.nextSibling
                while (start?.nextSibling !== end && start?.nextSibling) {
                    start?.parentElement?.removeChild(start?.nextSibling)
                }
            }

            try {
                const fn = Function.apply(null, args)

                const elems = fn.bind(this.bvrElement)(
                    appendElFromTemplate,
                    this.bvrElement,
                    tEl,
                    undefined,
                    $scopeId
                )
                //console.log('elements', elements);

                if (first) {
                    element = [element[0], ...elems, element[1]]
                } else {
                    const h = (
                        endElement: Comment,
                        element: HTMLElement | Comment | (HTMLElement | Comment)[]
                    ) => {
                        if (!Array.isArray(element)) {
                            endElement.before(element)
                        } else {
                            element.forEach((el) => {
                                h(endElement, el)
                            })
                        }
                    }
                    if (end) h(end, elems)
                }
            } catch (e) {
                console.error(e)
            }
        }

        set()
        return element
    }
}

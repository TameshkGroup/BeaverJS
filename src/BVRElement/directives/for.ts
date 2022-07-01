import { Element } from 'domhandler/lib'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import BVRElement, { appendElFromTemplate } from '..'
/* import * as ts from 'typescript'
 */
export default class ForDirective {
    constructor(private bvrElement: BVRElement) {}

    latestState: any[] = []

    static tagName = 'for'

    render(templateEl: Element, scope: any, parentScopeId: string) {
        const tEl = templateEl as Element
        let element: (HTMLElement | Comment)[] = []

        /* TODO Method of detect variables not work as expected */
        const vars = [
            ...(tEl.attribs['exp']
                .match(/(let|const|var)( |	|\n)+([a-zA-Z]|\$|_)+/g)
                ?.map((v) => v.replace(/(let|const|var)( |	|\n)/g, '')) || []),
            ...Object.keys(scope),
        ]?.join(',')

        console.log('for vars', vars)
        /*  const node = ts.createSourceFile('', tEl.attribs['exp'], ts.ScriptTarget.Latest)
        const vars: string[] = []
        node.forEachChild((child) => {
            if (ts.isVariableDeclaration(child)) {
                vars.push(child.getFullText())
            }
        }) */

        //v.match(/(?<=this\.)(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g)?.forEach((item) => {

        const exp = tEl.attribs['exp'].replaceAll(
            /((this\.))(?=([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g,
            'that.'
        )
        tEl.attribs['exp']
            .match(/this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g)
            ?.forEach(($var) => {
                //const propTrimmed = $propStr.replace('this.', '')

                this.bvrElement.addSubscribe(
                    $var.substring(5),
                    () => {
                        const state = Function.apply(null, [
                            `{${scope && Object.keys(scope).join(',')}}`,
                            tEl.attribs?.['key']
                                ? 'const that = this; return ' +
                                  rhs +
                                  '.map((i) => i["' +
                                  tEl.attribs?.['key'] +
                                  '"])'
                                : 'const that = this; return ' + rhs,
                        ]).bind(this.bvrElement)(scope)
                        if (!_.isEqual(state, this.latestState)) {
                            this.latestState = _.clone(state)
                            set()
                        }
                    },
                    parentScopeId
                )
            })

        //TODO fix it
        //@ts-ignore
        let lhs: string
        let rhs: string
        if (exp.indexOf('in') > 0) {
            const splited = exp.split('in')
            lhs = splited[0]
            rhs = splited[1]
        } else if (exp.indexOf('of') > 0) {
            const splited = exp.split('of')
            lhs = splited[0]
            rhs = splited[1]
        } else {
            lhs = ''
            rhs = ''
        }

        const code = `
                    const that = this;
                    const {${Object.keys(scope).join(',')}} = ${JSON.stringify(scope)}
                    const elements = []
                    for( ${exp} ){
                        elements.push(...tEl.children.map((tChild)=>{
                            return appendElFromTemplate(those, tChild, elem, {${vars},${Object.keys(scope).join(',')}}, scopeId)
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

        const state = Function.apply(null, [
            `{${scope && Object.keys(scope).join(',')}}`,
            tEl.attribs?.['key']
                ? 'const that = this; return ' +
                  rhs +
                  '.map((i) => i["' +
                  tEl.attribs?.['key'] +
                  '"])'
                : 'const that = this; return ' + rhs,
        ]).bind(this.bvrElement)(scope)

        //if (!_.isEqual(state, this.latestState)) {
        this.latestState = _.cloneDeep(state)
        set()
        //}

        return element
    }
}

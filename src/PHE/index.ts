import { Puya } from '../Puya'
import { DataNode, Document, Element } from 'domhandler/lib'
import _ from 'lodash'
import { getFromPath } from '../shared'
import ForDirective from './directives/for'
import IfDirective from './directives/if'

export enum ElementType {
    /** Type for the root element of a document */
    Root = 'root',
    /** Type for Text */
    Text = 'text',
    /** Type for <? ... ?> */
    Directive = 'directive',
    /** Type for <!-- ... --> */
    Comment = 'comment',
    /** Type for <script> tags */
    Script = 'script',
    /** Type for <style> tags */
    Style = 'style',
    /** Type for Any tag */
    Tag = 'tag',
    /** Type for <![CDATA[ ... ]]> */
    CDATA = 'cdata',
    /** Type for <!doctype ...> */
    Doctype = 'doctype',
}

export type Item = PHE | null | undefined | string | number

export function HTML(
    template: TemplateStringsArray,
    ...a: any[]
): Partial<Element> {
    const s = template.reduce<string>((acm, str, i) => {
        return acm + str + (i < template.length - 1 ? String(a[i]) : '')
    }, '')
    return s as any as Element
}

function domReady() {
    return new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(true))
        // If late; I mean on time.
        if (
            document.readyState === 'interactive' ||
            document.readyState === 'complete'
        ) {
            resolve(true)
        }
    })
}

export const appendElFromTemplate = (
    that: PHE,
    htmlParentEl: HTMLElement,
    templateEl: Partial<Element | DataNode | Document>,
    scope: any = undefined,
    scopeId?: string
) => {
    let element: HTMLElement | Text // = document.createTextNode('')
    if (templateEl.type === ElementType.Root) {
        ;(templateEl as Document).children.forEach((child, index) => {
            appendElFromTemplate(that, htmlParentEl, child, scope, scopeId)
        })
        return
    } else if (
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'for'
    ) {
        element = new ForDirective(that).render(
            templateEl as Element,
            scopeId as string
        )
    } else if(
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'if'
    ) {
        element = new IfDirective(that).render(
            templateEl as Element,
            scopeId as string
        )
    } else if (
        (templateEl.type === ElementType.Tag ||
            templateEl.type === ElementType.Style) &&
        (templateEl as Element).name
    ) {
        const tEl = templateEl as Element
        element = document.createElement(tEl.name)

        tEl.children.forEach((child) => {
            appendElFromTemplate(
                that,
                element as HTMLElement,
                child,
                scope,
                scopeId
            )
        })
        if (tEl.attribs)
            Object.entries(tEl.attribs).forEach(([attrName, attrValue]) => {
                if (attrName.indexOf('@') === 0) {
                    const event = attrName.replace('@', '')
                    //const elem = getElem(origin, childPath)
                    const code = attrValue //elem.getAttribute(attrName)
                    //if (attrName === '@click') {
                    if (!code) return

                    element.addEventListener(event, ($event) => {
                        const args = ['$event', code]
                        const fn = Function.apply(null, args)
                        //const fn = new Function(code).bind(this)
                        try {
                            fn.bind(that)($event)
                        } catch (e) {}
                    })
                } else {
                    ;(element as HTMLElement).setAttribute(attrName, attrValue)
                }
                //}
            })
    } else if (
        templateEl.type === ElementType.Text &&
        (templateEl as DataNode).data
    ) {
        const el = templateEl as DataNode
        element = document.createTextNode(el.data)

        const set = () => {
            element.textContent =
                el.data?.replace(/\{\{.+?}}((\(\d{0,10}\))){0,1}/g, (match) => {
                    let rawLength = match.match(/\{\{.+?}}/g)?.[0]?.length

                    const scopeStr = match
                        .substr(
                            2,
                            match.length - 4 - (match.length - (rawLength || 0))
                        )
                        .trim()

                    //Check if there is instance of a class in the scope

                    if (scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length) {
                        //const args = ['$event', 'Input']
                        //const fn = Function.apply(null, args)
                        //const fn = new Function(code).bind(this)
                        const instance = new that.$$components['Input']()
                        instance.$$parent = that;
                        element = document.createElement('div')
                        //element.replaceChild(element,root)
                        instance.$$rootElement = element
                        //getElem(parsed, childPath).parentElement ||

                        instance.mount()
                        return
                    } else {
                        try {
                            const ev = eval('scope.' + scopeStr)
                            if (ev) {
                                return ev
                            }
                            try {
                                const res = new Function(
                                    'return ' + scopeStr
                                ).bind(that)()
                                if (res) {
                                    return res
                                }
                            } catch (e) {}
                        } catch (e) {}
                        console.log('setting', that, scopeStr)
                        return getFromPath(
                            that,
                            scopeStr.replace('this.', '')
                        )
                    }
                }) || ''
        }

        element.textContent?.match(/<[\?]js.*/g)?.forEach((match) => {
            console.log('js block', match)
        })

        element.textContent
            ?.match(/\{\{.+?}}((\(\d{0,10}\))){0,1}/g)
            ?.forEach((match) => {
                console.log('match', match)
                const thrMatch = match.match(/\}\}\(\d{0,10}\)/g)?.[0]
                const throttleStr = 
                    thrMatch?.slice(3, thrMatch.length - 1) || '0'
                const throttle = parseInt(throttleStr);
                console.log('thr', throttle)

                const scopeStr = match.slice(2, match.length - (throttleStr.length + 1)).trim()
            
                //Check if there is instance of a class in the scope
                if (scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length) {
                } else {
                    //const m = _.throttle(set, 10)
                    //console.log('item', scopeStr)
                    scopeStr.match(/this(.\w){0,}/g)?.forEach((item) => {
                        item = item.slice(5)//item.replace(/this\./, '')
                        console.log('item', item);
                        that.addSubscribe(item, set, scopeId, throttle)
                    });
                }
            })

        set()
        //} else if (templateEl.type === ElementType.Directive) {
        // const el = templateEl as DataNode
        //element = document.createTextNode(el.data.slice(3, -1))
    } else {
        console.log('unknown el type', templateEl)
        element = document.createElement('none')
    }

    htmlParentEl.append(element)
}

// export function HTML(input: TemplateStringsArray, ...args: any): Item[] {
//     return input.reduce((acm, value, i) => {
//         return [...acm, value, args[i]]
//     }, [])
// }

export class PHE extends Puya {
    static $$includedElems: Record<string, typeof PHE> = {}
    $$rootElement: HTMLElement = document.createElement('div')
    $$parent?: PHE

    $$directives = []

    $$components: Record<string, typeof PHE> = {}
    constructor(private $$elementSelector?: string) {
        super()
        console.log('$$elementSelector', $$elementSelector)
    }

    template(): Partial<Element> | void {}

    mounted() {}

    async mount() {
        await domReady()
        await new Promise((resolve) => {
            this.addBeforeMountListener(() => {
                resolve(true)
            })
        })
        if (this.$$elementSelector)
            this.$$rootElement =
                document.querySelector(this.$$elementSelector) ||
                this.$$rootElement
        console.log('elementSelector', this.$$elementSelector, document);
        this.render()
        this.mounted()
    }

    $$template: Partial<Element> = {
        type: ElementType.Tag,
        tagName: 'div',
    }

    render() {
        this.$$template = this.template() || this.$$template

        let phes: PHE[] = []

        let parsed: HTMLElement = document.createElement('div')

        const findTargetElement = (
            el: HTMLElement,
            path: number[]
        ): HTMLElement => {
            if (!Array.isArray(path[0])) {
                return el
            } else {
                return findTargetElement(
                    parsed.childNodes[path[0]] as HTMLElement,
                    path.slice(1)
                )
            }
        }

        this.$$template = this.template() || this.$$template

        const createDOM = (template: Partial<Element>, path: number[] = []) => {
            if (path.length === 0) {
                parsed = document.createElement(template.tagName || 'div')
                template.children?.forEach((childTemplate, index) => {
                    createDOM(childTemplate, [...path, index])
                })
            } else {
                template.children?.forEach((childTemplate, index) => {
                    createDOM(childTemplate, [...path, index])
                })
                const parentElement = findTargetElement(
                    parsed,
                    path.slice(undefined, -1)
                )
                appendElFromTemplate(this, parentElement, template)
            }

            template.tagName
        }

        //createDOM(this.$$template, [])
        appendElFromTemplate(this, this.$$rootElement, this.$$template)

        phes.forEach((phe) => {
            parsed.innerHTML = parsed.innerHTML.replace(
                `__$$__${phe.$id}__$$__`, //'<div><!--THIS DATA SHOULD BE REPLACED--></div>',
                `<div phid=${phe.$id}></div>`
            )
            const rootElement = parsed.querySelector(`[phid="${phe.$id}"]`)
            if (!rootElement || !(rootElement instanceof HTMLElement)) {
                return
            }
            phe.$$rootElement = rootElement

            phe.mount()
        })

        console.log('parsed', parsed, this.$$rootElement);

        if (this.$$rootElement) this.$$rootElement.appendChild(parsed)
    }
}

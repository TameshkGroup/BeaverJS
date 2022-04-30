import { Puya } from '../Puya'
import { DataNode, Document, Element } from 'domhandler/lib'
import _ from 'lodash'
import { getFromPath, setByPath } from '../shared'
import ForDirective from './directives/for'
import IfDirective from './directives/if'
import ComponentDirective from './directives/component'

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

export type Item = BVRElement | null | undefined | string | number

export function html(template: TemplateStringsArray, ...a: any[]): Partial<Element> {
    const s = template.reduce<string>((acm, str, i) => {
        return acm + str + (i < template.length - 1 ? String(a[i]) : '')
    }, '')
    return s as any as Element
}

function domReady() {
    return new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(true))
        // If late; I mean on time.
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            resolve(true)
        }
    })
}

export const appendElFromTemplate = (
    that: BVRElement,
    templateEl: Partial<Element | DataNode | Document> | Partial<Element | DataNode | Document>[],
    htmlParentEl?: HTMLElement,
    scope: Record<string, any> = {},
    scopeId?: string,
    replace = false
): string | HTMLElement | Text | undefined | (HTMLElement | Comment)[] => {
    let element: HTMLElement | Text | string | (HTMLElement | Comment)[] // = document.createTextNode('')
    if (Array.isArray(templateEl) || templateEl.type === ElementType.Root) {
        const iter = (templateEl as Document).children || templateEl
        return iter.map((child) => {
            return appendElFromTemplate(
                that,
                child,
                htmlParentEl,
                scope || {},
                scopeId
            ) as HTMLElement
        })
    } else if (
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'for'
    ) {
        element = new ForDirective(that).render(
            templateEl as Element,
            scope || {},
            scopeId as string
        )
    } else if (
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'if'
    ) {
        element = new IfDirective(that).render(
            templateEl as Element,
            scope || {},
            scopeId as string
        )
    } else if (
        templateEl.type === ElementType.Tag &&
        that.$$elements?.[(templateEl as Element).name]
    ) {
        console.log('rerender', replace, that, templateEl)
        element = new ComponentDirective(that).render(
            templateEl as Element,
            scope,
            scopeId as string
        )
    } else if (templateEl.type === ElementType.Tag && (templateEl as Element).name === 'slot') {
        console.log(
            'slot name',
            (templateEl as Element).attribs.name,
            (templateEl as Element).attribs['set.name']
        )
        if (that?.$$parent && (templateEl as Element)?.attribs?.['name']) {
            const filler = that.$$slots?.[(templateEl as Element).attribs.name || 'default']?.filler
            if (filler)
                element =
                    appendElFromTemplate(
                        that?.$$parent,
                        (filler as { children: Partial<Element | DataNode | Document>[] })
                            ?.children,
                        undefined,
                        scope,
                        scopeId
                    ) || ''
        } else {
            console.log(
                'dynamic slot detected',
                scope,
                templateEl as Element,
                `
            const {${scope && Object.keys(scope).join(',')}} = ${JSON.stringify(scope)}
            return ` + (templateEl as Element).attribs['set.name']
            )
            if ((templateEl as Element).attribs['set.name'] && that?.$$parent) {
                const slotName = Function.apply(null, [
                    '',
                    `
                    const {${scope && Object.keys(scope).join(',')}} = ${JSON.stringify(scope)};
                    return ` + (templateEl as Element).attribs['set.name'],
                ]).bind(that)()
                const filler = that.$$slots?.[slotName]?.filler
                console.log('dynamic filler', filler)
                if (filler)
                    element =
                        appendElFromTemplate(
                            that?.$$parent,
                            filler as Element,
                            undefined,
                            scope,
                            scopeId
                        ) || ''
            }
            //element = ''
        }
        //@ts-ignore
        if (typeof element === 'undefined') element = ''
        //element = JSON.stringify(that.$$slots)
    } else if (
        (templateEl.type === ElementType.Tag || templateEl.type === ElementType.Style) &&
        (templateEl as Element).name
    ) {
        const tEl = templateEl as Element
        element = document.createElement(tEl.name)

        tEl.children.forEach((child) => {
            appendElFromTemplate(that, child, element as HTMLElement, scope, scopeId)
        })
        if (tEl.attribs)
            Object.entries(tEl.attribs).forEach(([attrName, attrValue]) => {
                if (attrName.indexOf('@') === 0) {
                    const event = attrName.replace('@', '')
                    const code = attrValue
                    if (!code) return
                    if (element instanceof HTMLStyleElement || element instanceof HTMLElement)
                        element.addEventListener(event, ($event) => {
                            const args = ['$event', code]
                            const fn = Function.apply(null, args)
                            try {
                                fn.bind(that)($event)
                            } catch (e) {}
                        })
                } else if (attrName === '$') {
                    const set = () => {
                        Function.apply(null, ['$', attrValue]).bind(that)(element)
                    }

                    attrValue
                        .match(/this\.(([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g)
                        ?.forEach((item) => {
                            that.addSubscribe(item.substring(5), set, scopeId)
                        })

                    set()
                } else {
                    let childToParent = false
                    let parentToChild = false
                    let str = attrName
                    let pos = attrName.lastIndexOf('}')
                    if (pos > attrName.length - 2) {
                        str = str.slice(0, pos)
                        childToParent = true
                    }
                    pos = attrName.lastIndexOf('{')
                    if (pos > attrName.length - 3) {
                        str = str.slice(0, pos)
                        parentToChild = true
                    }

                    try {
                        const ev = eval('scope.' + attrValue)
                        if (ev !== undefined) {
                            ;(element as any)[str] = ev
                            return
                        }
                    } catch (e) {
                        try {
                            const res: any = new Function('return ' + attrValue).bind(that)()
                            ;(element as any)[str] = res //.setAttribute(str, res)
                        } catch (e) {}
                    }

                    if (parentToChild) {
                        attrValue
                            .match(/this\.(([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g)
                            ?.forEach((item) => {
                                that.addSubscribe(item.substring(5), (value) => {
                                    ;(element as HTMLInputElement).value = value
                                })
                            })

                        const set = () => {
                            ;(element as any)[str] = Function.apply(null, [
                                '',
                                'return ' + attrValue,
                            ]).bind(that)()
                        }

                        attrValue.match(/this(.\w){0,}/g)?.forEach((item) => {
                            item = item.slice(5) //item.replace(/this\./, '')
                            that.addSubscribe(item, set, scopeId)
                        })

                        set()
                    }

                    if (childToParent) {
                        //TODO specify currect listener for each element type
                        if (element instanceof HTMLStyleElement || element instanceof HTMLElement) {
                            element.addEventListener('change', (event) => {
                                const value = (event.currentTarget as any)?.[str]
                                if (!_.isEqual(getFromPath(that, attrValue.slice(5)), value)) {
                                    setByPath(that, attrValue.slice(5), value)
                                }
                            })

                            element.addEventListener('input', (event) => {
                                const value = (event.currentTarget as any)?.[str]
                                if (!_.isEqual(getFromPath(that, attrValue.slice(5)), value)) {
                                    setByPath(that, attrValue.slice(5), value)
                                }
                            })
                        }
                    }

                    if (!parentToChild && !childToParent) {
                        ;(element as HTMLElement).setAttribute(attrName, attrValue)
                    }
                }
                //}
            })
    } else if (templateEl.type === ElementType.Text && (templateEl as DataNode).data) {
        const el = templateEl as DataNode
        element = document.createTextNode(el.data)

        const set = () => {
            if (element instanceof Text)
                element.textContent =
                    el.data?.replace(/\{\{.+?}}((\(\d{0,10}\))){0,1}/g, (match) => {
                        let rawLength = match.match(/\{\{.+?}}/g)?.[0]?.length

                        const scopeStr = match
                            .substr(2, match.length - 4 - (match.length - (rawLength || 0)))
                            .trim()

                        //Check if there is instance of a class in the scope

                        try {
                            const ev = eval('scope.' + scopeStr)
                            if (ev !== undefined) {
                                return ev
                            }
                        } catch (e) {}
                        try {
                            const res = new Function('return ' + scopeStr).bind(that)()
                            return res
                        } catch (e) {}
                        /* try {
                            const ev = eval(scopeStr)
                            if (ev !== undefined) return ev
                        } catch {} */
                        /* if (scopeStr.slice(0, 5) === 'this.')
                            return getFromPath(
                                that,
                                scopeStr.replace('this.', '')
                            ) */
                    }) || ''
        }

        element.textContent?.match(/<[\?]js.*/g)?.forEach((match) => {
            console.log('js block', match)
        })

        element.textContent?.match(/\{\{.+?}}((\(\d{0,10}\))){0,1}/g)?.forEach((match) => {
            const thrMatch = match.match(/\}\}\(\d{0,10}\)/g)?.[0]
            const throttleStr = thrMatch?.slice(3, thrMatch.length - 1) || '0'
            const throttle = parseInt(throttleStr)

            const scopeStr = match.slice(2, match.length - (throttleStr.length + 1)).trim()

            //Check if there is instance of a class in the scope
            if (scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length) {
            } else {
                //const m = _.throttle(set, 10)
                scopeStr
                    .match(/this\.(([A-z]|_)+([A-z]|_|\d)*)(\.(([A-z]|_)+([A-z]|_|\d)*))*/g)
                    ?.forEach((item) => {
                        that.addSubscribe(item.substring(5), set, scopeId, throttle)
                    })
            }
        })

        set()
    } else {
        element = document.createElement('none')
    }

    if (Array.isArray(element)) {
        const h = (
            parent: HTMLElement,
            element: HTMLElement | Comment | (HTMLElement | Comment)[]
        ) => {
            if (!Array.isArray(element)) {
                parent.append(element)
            } else {
                element.forEach((el) => {
                    h(parent, el)
                })
            }
        }
        if (htmlParentEl) h(htmlParentEl, element)
    } else {
        htmlParentEl?.append?.(element)
    }
    return element
}

// export function HTML(input: TemplateStringsArray, ...args: any): Item[] {
//     return input.reduce((acm, value, i) => {
//         return [...acm, value, args[i]]
//     }, [])
// }
type Slot = {
    filler?: Partial<Element | DataNode | Document>
    templatePath: number[]
}

export default class BVRElement extends Puya {
    static $$includedElems: Record<string, typeof BVRElement> = {}
    $$rootElement: HTMLElement = document.createElement('div')
    $$parent?: BVRElement
    $$elementSelector?: string
    $$slots: Record<string, Slot> = {}
    $$elementInstances: Record<string, BVRElement> = {}
    props: Record<string, any> = {}

    constructor() {
        super()
    }

    $$directives = []

    $$elements: Record<string, Constructor<BVRElement>> = {}
    $$element!: Constructor<BVRElement>
    $$elementName!: string

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
                document.querySelector(this.$$elementSelector) || this.$$rootElement
        this.$$rootElement.innerHTML = ''
        this.render()
        this.mounted()
    }

    $$template: Partial<Element> = {
        type: ElementType.Tag,
        tagName: 'div',
    }

    reRender() {
        //this.$$template = this.template() || this.$$template
        appendElFromTemplate(this, this.$$template, this.$$rootElement, undefined, undefined, true)
    }

    render() {
        this.$$template = this.template() || this.$$template

        appendElFromTemplate(this, this.$$template, this.$$rootElement, undefined, undefined)
    }
}

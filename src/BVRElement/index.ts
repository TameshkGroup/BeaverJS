import { Puya } from '../Puya'
import { DataNode, Document, Element } from 'domhandler/lib'
import _ from 'lodash'
import { getFromPath, setByPath } from '../shared'
import ForDirective from './directives/for'
import IfDirective from './directives/if'
import ComponentDirective from './directives/component'
import StyleDirective from './directives/style'

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
    scopeId?: string
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
        element = new ComponentDirective(that).render(
            templateEl as Element,
            scope,
            scopeId as string
        )
    } else if (templateEl.type === ElementType.Style) {
        /** Element is style */
        element = new StyleDirective(that).render(templateEl as Element, scope, scopeId as string)
    } else if (templateEl.type === ElementType.Tag && (templateEl as Element).name === 'slot') {
        /** Element is slot */
        /** Element is static slot */
        if (that?.$$parent && !(templateEl as Element)?.attribs?.['set.name']) {
            const filler = that.$$slots?.[(templateEl as Element).attribs.name || 'default']?.filler
            if (filler) {
                element =
                    appendElFromTemplate(
                        that?.$$parent,
                        (filler as { children: Partial<Element | DataNode | Document>[] })
                            ?.children,
                        undefined,
                        {
                            ...that.$$slots?.[(templateEl as Element).attribs.name || 'default']
                                ?.scope,
                            ...scope,
                        },
                        scopeId
                    ) || ''
            }
        } else {
            /** Element is dynamic slot */
            if ((templateEl as Element).attribs['set.name'] && that?.$$parent) {
                const slotName = Function.apply(null, [
                    `{${scope && Object.keys(scope).join(',')}}`,
                    `return ` + (templateEl as Element).attribs['set.name'],
                ]).bind(that)(scope)
                const filler = that.$$slots?.[slotName]?.filler

                if (filler)
                    element =
                        appendElFromTemplate(
                            that?.$$parent,
                            filler as Element,
                            undefined,
                            { ...scope, ...that.$$slots?.[slotName].scope },
                            scopeId
                        ) || ''
            }
            //element = ''
        }
        //@ts-ignore
        if (typeof element === 'undefined') element = ''
        //element = JSON.stringify(that.$$slots)
    } else if (templateEl.type === ElementType.Tag && (templateEl as Element).name) {
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
                            const args = [
                                `$event,$,{${scope && Object.keys(scope).join(',')}}`,
                                code,
                            ]
                            const fn = Function.apply(null, args)
                            try {
                                fn.bind(that)($event, element, scope)
                            } catch (e) {
                                console.error(e)
                            }
                        })
                } else if (attrName === '$') {
                    const set = () => {
                        Function.apply(null, ['$', attrValue]).bind(that)(element)
                    }

                    attrValue
                        .match(
                            /this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g
                        )
                        ?.forEach((item) => {
                            that.addSubscribe(item.substring(5), set, scopeId)
                        })

                    set()
                } else {
                    //TODO handle class and style for HTML elements
                    //TODO style should support object and string
                    if (attrName.indexOf('set.') === 0) {
                        const set = () => {
                            const dynAttrName = attrName.slice(4)

                            if (dynAttrName === 'class') {
                                Function.apply(null, [
                                    `$,{${Object.keys(scope).join(',')}}`,
                                    `
                                        const $value = ${attrValue};
                                        $.setAttribute( 'class' , 
                                            (('${tEl.attribs[attrName.slice(4)]} '
                                            + $value)));
                                        `,
                                ]).bind(that)(element, scope)
                            } else if (dynAttrName === 'style') {
                                Function.apply(null, [
                                    `$,{${Object.keys(scope).join(',')}}`,
                                    `
                                        const $value = ${attrValue};
                                        console.log('setting', ($value), "${attrValue}" , '${attrName.replace(
                                        'set.',
                                        ''
                                    )}');
                                        $.setAttribute( '${attrName.replace('set.', '')}' , (('${
                                        tEl.attribs[attrName.slice(4)]
                                    } ' + $value)));
                                        
                                        `,
                                ]).bind(that)(element, scope)
                            } else {
                                Function.apply(null, [
                                    `$,{${Object.keys(scope).join(',')}}`,
                                    `
                                        const $value = ${attrValue};
                                        $.${attrName.replace('set.', '')} = $value;
                                        `,
                                ]).bind(that)(element, scope)
                            }

                            //setByPath(element as any, attrName.replace('set.', '').split('.'), v)
                        }

                        attrValue
                            .match(
                                /this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\[[^]]+\])?(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d\)*))(\[[^]]+\])?)*/g
                            )
                            ?.forEach((item) => {
                                that.addSubscribe(
                                    item.replace(/(\[[^]]+\])/g, '.*').substring(5),
                                    set,
                                    scopeId
                                )
                            })

                        set()
                    } else if (attrName.indexOf('get.') === 0) {
                        const str = attrName.replace('get.', '')

                        if (element instanceof HTMLStyleElement || element instanceof HTMLElement) {
                            if (attrValue.indexOf('=') >= 0) {
                                let assignment: { rhs: string; lhs: string } = {
                                    rhs: attrValue.slice(attrValue.indexOf('=') + 1).trim(),
                                    lhs: attrValue.slice(0, attrValue.indexOf('=')).trim(),
                                }
                                {
                                    element.addEventListener(str, ($event) => {
                                        const value = Function.apply(null, [
                                            '$,$event',
                                            'return ' + assignment.rhs,
                                        ]).bind(that)(element, $event)

                                        //DEEP Equality check
                                        if (
                                            !_.isEqual(
                                                getFromPath(that, assignment.lhs.slice(5)),
                                                value
                                            )
                                        ) {
                                            Function.apply(null, [
                                                `$,{${scope && Object.keys(scope).join(',')}}`,
                                                assignment.lhs + ' = ' + assignment.rhs,
                                            ]).bind(that)(element, scope)
                                            //setByPath(that, assignment.lhs.slice(5), value)
                                        }
                                    })
                                }
                            } else {
                                if (str.indexOf('boundingRect') === 0) {
                                    const setFn = Function.apply(null, [
                                        `$value,{${scope && Object.keys(scope).join(',')}}`,
                                        `
                                        if(${attrValue}?.height !== $value?.height)
                                            ${attrValue} = $value.height
                                        `,
                                    ]).bind(that)
                                    new ResizeObserver((entries) => {
                                        for (let entry of entries) {
                                            const cr = entry.contentRect
                                            setFn(cr.toJSON(), scope)
                                            //setByPath(that, attrValue.slice(5), _.clone(cr))
                                        }
                                    }).observe(element)
                                    /* setTimeout(() => {
                                                setByPath(
                                                    that,
                                                    attrValue.slice(5),
                                                    (element as HTMLElement).getClientRects()
                                                )
                                            }, 100) */
                                } else {
                                    element.addEventListener(str, ($event) => {
                                        let value: any
                                        if (
                                            element instanceof HTMLInputElement &&
                                            ['text', 'tel', 'password'].includes(element.type)
                                        )
                                            value = ($event.target as HTMLInputElement).value
                                        else if (
                                            element instanceof HTMLInputElement &&
                                            ['checkbox'].includes(element.type)
                                        ) {
                                            value = ($event.target as HTMLInputElement).checked
                                        }
                                        if (
                                            !_.isEqual(getFromPath(that, attrValue.slice(5)), value)
                                        ) {
                                            //DEEP Equality check
                                            //that[v.slice(5)] = value;
                                            setByPath(that, attrValue.slice(5), value)
                                        }
                                    })
                                }
                            }
                        }
                    } else {
                        ;(element as HTMLElement).setAttribute(attrName, attrValue)
                    }
                }
                //}
            })
        element.setAttribute('instance_id', that.$id)
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

                        try {
                            const res = Function.apply(null, [
                                `{${scope && Object.keys(scope).join(',')}}`,
                                'return ' + scopeStr,
                            ]).bind(that)(scope)
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
                    .match(
                        /this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g
                    )
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
    scope: any
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
        appendElFromTemplate(this, this.$$template, this.$$rootElement, undefined, undefined)
    }

    render() {
        this.$$template = this.template() || this.$$template

        appendElFromTemplate(this, this.$$template, this.$$rootElement, undefined, undefined)
    }

    provide(l: any) {
        setTimeout(() => {
            console.log('l', l)
        }, 2000)
    }
}

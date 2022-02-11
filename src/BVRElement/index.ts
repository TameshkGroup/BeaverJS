import { Puya } from '../Puya'
import { DataNode, Document, Element } from 'domhandler/lib'
import _ from 'lodash'
import { getFromPath, setByPath } from '../shared'
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
    htmlParentEl: HTMLElement,
    templateEl: Partial<Element | DataNode | Document>,
    scope: any = undefined,
    scopeId?: string
) => {
    let element: HTMLElement | Text // = document.createTextNode('')
    if (templateEl.type === ElementType.Root) {
        ;(templateEl as Document).children.forEach((child) => {
            appendElFromTemplate(that, htmlParentEl, child, scope, scopeId)
        })
        return
    } else if (
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'for'
    ) {
        element = new ForDirective(that).render(templateEl as Element, scopeId as string)
    } else if (
        templateEl.type === ElementType.Tag &&
        (templateEl as Element).name?.toLowerCase() === 'if'
    ) {
        element = new IfDirective(that).render(templateEl as Element, scopeId as string)
    } else if (
        templateEl.type === ElementType.Tag &&
        that.$$elements?.[(templateEl as Element).name]
    ) {
        console.log('bvr element detected')
        //element = document.createElement('div')

        //console.log('attribs', args)

        const fn = Function.apply(null, ['cmp', 'return new cmp(' + ')'])

        const instance = fn.bind(that)(that.$$elements?.[(templateEl as Element).name]) as BVRElement
        instance.props = {}

        Object.entries((templateEl as Element).attribs).forEach(([k, v]) => {
            if (k.indexOf('@') === 0) {
                const event = k.replace('@', '')
                const code = k
                if (!code) return

                const fn = Function.apply(null, ['$event', code])
                /* instance.addEventListener(event, ($event) => {
                    try {
                        fn.bind(that)($event)
                    } catch (e) {}
                }) */
                // TODO
            } else if (k === '$') {
                const set = () => {
                    Function.apply(null, ['$', v]).bind(that)(instance)
                }

                v.match(/this(.\w){0,}/g)?.forEach((item) => {
                    item = item.slice(5) //item.replace(/this\./, '')
                    that.addSubscribe(item, set, scopeId)
                })

                set()
            } else {
                let childToParent = false
                let parentToChild = false
                let str = k
                let pos = k.lastIndexOf('}')
                if (pos > k.length - 2) {
                    str = str.slice(0, pos)
                    childToParent = true
                }
                pos = k.lastIndexOf('{')
                if (pos > k.length - 3) {
                    str = str.slice(0, pos)
                    parentToChild = true
                }

                try {
                    const ev = eval('scope.' + v)
                    if (ev !== undefined) {
                        instance.props[str] = ev
                        return
                    }
                } catch (e) {
                    try {
                        const res = new Function('return ' + v).bind(that)()
                        instance.props[str] = res
                    } catch (e) {}
                }

                if (parentToChild) {
                    const set = () =>{
                        instance.props[str] = Function.apply(null, [
                            '',
                            'return ' + v,
                        ]).bind(that)()
                    }

                    v.match(/this(.\w){0,}/g)?.forEach((item) => {
                        item = item.slice(5) //item.replace(/this\./, '')
                        that.addSubscribe(item, set, scopeId)
                    })

                    set();
                }

                if (childToParent) {
                    instance.addSubscribe('props.' + str, (value) => {
                        //DEEP Equality check
                        if (!_.isEqual(getFromPath(that, v.slice(5)), value)) {
                            //that[v.slice(5)] = value;
                            setByPath(that, v.slice(5), value)
                        }
                    })
                }
            }
        })

        /* componentArgs
            ?.match(/this(.\w){0,}/g)
            ?.map((item, i) => {
                console.log(item, i)
            }) */

        /* const propsStr = componentArgs?.split(
            /,(?=(?:[^\"]*\"[^\"]*\")*([^\"])*$)/
        )[0] */
        /* if (propsStr) {
            const props = propsStr
                .trim()
                .slice(1, -1)
                ?.split(
                    /,(?=(?:[^\"]*\"[^\"]*\")*([^\"])*$)/
                )
                .map((i) =>
                    i.split(
                        /:(?=(?:[^\"]*\"[^\"]*\")*([^\"])*$)/
                    )
                )

            console.log('props', props)
        } */

        instance.$$parent = that
        element = document.createElement('div')
        //element.replaceChild(element,root)
        instance.$$rootElement = element
        //getElem(parsed, childPath).parentElement ||

        instance.mount()
    } else if (
        (templateEl.type === ElementType.Tag || templateEl.type === ElementType.Style) &&
        (templateEl as Element).name
    ) {
        const tEl = templateEl as Element
        element = document.createElement(tEl.name)

        tEl.children.forEach((child) => {
            appendElFromTemplate(that, element as HTMLElement, child, scope, scopeId)
        })
        if (tEl.attribs)
            Object.entries(tEl.attribs).forEach(([attrName, attrValue]) => {
                if (attrName.indexOf('@') === 0) {
                    const event = attrName.replace('@', '')
                    const code = attrValue
                    if (!code) return

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

                    attrValue.match(/this(.\w){0,}/g)?.forEach((item) => {
                        item = item.slice(5) //item.replace(/this\./, '')
                        that.addSubscribe(item, set, scopeId)
                    })

                    set()
                } else {
                    let childToParent = false
                    let parentToChild = false
                    let str = attrName
                    let pos = attrName.lastIndexOf('}')
                    if (pos > attrName.length - 2) {
                        console.log('childToParent')
                        str = str.slice(0, pos)
                        childToParent = true
                    }
                    pos = attrName.lastIndexOf('{')
                    if (pos > attrName.length - 3) {
                        console.log('parentToChild')
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
                        if (attrValue.slice(0, 5) == 'this.')
                            that.addSubscribe(attrValue.slice(5), (value) => {
                                ;(element as HTMLInputElement).value = value
                            })


                            const set = () =>{
                                (element as any)[str] = Function.apply(null, [
                                    '',
                                    'return ' + attrValue,
                                ]).bind(that)()
                            }
        
                            attrValue.match(/this(.\w){0,}/g)?.forEach((item) => {
                                item = item.slice(5) //item.replace(/this\./, '')
                                that.addSubscribe(item, set, scopeId)
                            })
        
                            set();
                    }

                    if (childToParent) {
                        //TODO specify currect listener for each element type
                        element.addEventListener('change', (event) => {
                            const value = (event.currentTarget as any)?.[str];
                            if (!_.isEqual(getFromPath(that, attrValue.slice(5)), value)) {
                                setByPath(that, attrValue.slice(5), value)
                            }
                        });
                        element.addEventListener('input', (event) => {
                            const value = (event.currentTarget as any)?.[str];
                            if (!_.isEqual(getFromPath(that, attrValue.slice(5)), value)) {
                                setByPath(that, attrValue.slice(5), value)
                            }
                        })
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
                scopeStr.match(/this(.\w){0,}/g)?.forEach((item) => {
                    item = item.slice(5) //item.replace(/this\./, '')
                    //console.log('item instead slice ', scopeStr, item, that)
                    that.addSubscribe(item, set, scopeId, throttle)
                })
            }
        })

        set()
    } else {
        element = document.createElement('none')
    }

    htmlParentEl.append(element)
}

// export function HTML(input: TemplateStringsArray, ...args: any): Item[] {
//     return input.reduce((acm, value, i) => {
//         return [...acm, value, args[i]]
//     }, [])
// }

export default class BVRElement extends Puya {
    static $$includedElems: Record<string, typeof BVRElement> = {}
    $$rootElement: HTMLElement = document.createElement('div')
    $$parent?: BVRElement
    $$elementSelector?: string
    props: Record<string, any> = {}

    $$directives = []

    $$elements: Record<string, Constructor<BVRElement>> = {}

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
        this.render()
        this.mounted()
    }

    $$template: Partial<Element> = {
        type: ElementType.Tag,
        tagName: 'div',
    }

    render() {
        this.$$template = this.template() || this.$$template
        let bvrElements: BVRElement[] = []
        let parsed: HTMLElement = document.createElement('div')

        const findTargetElement = (el: HTMLElement, path: number[]): HTMLElement => {
            if (!Array.isArray(path[0])) {
                return el
            } else {
                return findTargetElement(parsed.childNodes[path[0]] as HTMLElement, path.slice(1))
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
                const parentElement = findTargetElement(parsed, path.slice(undefined, -1))
                appendElFromTemplate(this, parentElement, template, undefined, undefined)
            }

            template.tagName
        }

        //createDOM(this.$$template, [])
        appendElFromTemplate(this, this.$$rootElement, this.$$template, undefined, undefined)

        bvrElements.forEach((bvrElement) => {
            parsed.innerHTML = parsed.innerHTML.replace(
                `__$$__${bvrElement.$id}__$$__`, //'<div><!--THIS DATA SHOULD BE REPLACED--></div>',
                `<div phid=${bvrElement.$id}></div>`
            )
            const rootElement = parsed.querySelector(`[phid="${bvrElement.$id}"]`)
            if (!rootElement || !(rootElement instanceof HTMLElement)) {
                return
            }
            bvrElement.$$rootElement = rootElement

            bvrElement.mount()
        })

        if (this.$$rootElement) this.$$rootElement.appendChild(parsed)
    }
}

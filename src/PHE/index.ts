import { PHD } from '../PHD'
import _ from 'lodash'
import HTMLParser from 'fast-html-parser'
import { DataNode, Document, Element } from 'domhandler/lib'
import { ElementType } from 'htmlparser2'

let l = 0

export type Item = PHE | null | undefined | string | number

function getElem(obj: HTMLElement, path: number[]) {
    return path.reduce<HTMLElement>(
        (res, key) => res.childNodes?.[key] as HTMLElement,
        obj
    )
}

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

// export function HTML(input: TemplateStringsArray, ...args: any): Item[] {
//     return input.reduce((acm, value, i) => {
//         return [...acm, value, args[i]]
//     }, [])
// }

export class PHE extends PHD {
    static $$includedElems: Record<string, typeof PHE> = {}
    $$rootElement: HTMLElement = document.createElement('div')
    components: Record<string, typeof PHE> = {}
    constructor(private $$elementSelector?: string) {
        super()
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
        console.log('template', this.$$template)

        const appendElFromTemplate = (
            htmlParentEl: HTMLElement,
            templateEl: Partial<Element | DataNode | Document>
        ) => {
            let element: HTMLElement | Text // = document.createTextNode('')
            if (templateEl.type === ElementType.Root) {
                ;(templateEl as Document).children.forEach((child, index) => {
                    appendElFromTemplate(htmlParentEl, child)
                })
                return
            } else if (
                templateEl.type === ElementType.Tag &&
                (templateEl as Element).name
            ) {
                const el = templateEl as Element
                element = document.createElement(el.name)
                const directives = []
                el.children.forEach((child, index) => {
                    if (child.type === ElementType.Directive) {
                        const el = child as DataNode
                        directives.push(el.data.slice(3, -1))
                    } else {
                        appendElFromTemplate(element as HTMLElement, child)
                    }
                })
                if (el.attribs)
                    Object.entries(el.attribs).forEach(
                        ([attrName, attrValue]) => {
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
                                    fn.bind(this)($event)
                                })
                            } else {
                                ;(element as HTMLElement).setAttribute(
                                    attrName,
                                    attrValue
                                )
                            }
                            //}
                        }
                    )
            } else if (
                templateEl.type === ElementType.Text &&
                (templateEl as DataNode).data
            ) {
                const el = templateEl as DataNode
                element = document.createTextNode(el.data)

                const set = () => {
                    element.textContent =
                        el.data?.replace(/\{\{.+?}}/g, (match) => {
                            const scopeStr = match
                                .substr(2, match.length - 4)
                                .trim()

                            //Check if there is instance of a class in the scope

                            if (
                                scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length
                            ) {
                                const args = ['$event', 'Input']
                                //const fn = Function.apply(null, args)
                                //const fn = new Function(code).bind(this)
                                const instance = new this.components['Input']()
                                element = document.createElement('div')
                                //element.replaceChild(element,root)
                                instance.$$rootElement = element
                                //getElem(parsed, childPath).parentElement ||

                                instance.mount()
                                return
                            } else {
                                return _.get(this.ctx, scopeStr)
                            }
                        }) || ''
                }

                element.textContent?.match(/<[\?]js.*/g)?.forEach((match) => {
                    console.log('js block', match)
                })

                element.textContent?.match(/\{\{.+?}}/g)?.forEach((match) => {
                    const scopeStr = match.substr(2, match.length - 4).trim()
                    //Check if there is instance of a class in the scope
                    if (scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length) {
                    } else {
                        this.subscribs[scopeStr] = [
                            ...(this.subscribs[scopeStr]
                                ? this.subscribs[scopeStr]
                                : []),
                            () => {
                                set()
                                l++
                            },
                        ]
                    }
                })

                set()
                //} else if (templateEl.type === ElementType.Directive) {
                // const el = templateEl as DataNode
                //element = document.createTextNode(el.data.slice(3, -1))
            } else {
                console.log('unknow el type', templateEl)
            }

            htmlParentEl.append(element)
        }

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
                appendElFromTemplate(parentElement, template)
            }

            template.tagName
        }

        //createDOM(this.$$template, [])
        appendElFromTemplate(this.$$rootElement, this.$$template)

        //const parsed = origin.cloneNode(true) as HTMLElement

        /*  const parse = (path: number[] = []) => {
            getElem(origin, path).childNodes.forEach((child, i) => {
                let childPath = [...path, i]

                getElem(origin, childPath)
                    .getAttributeNames?.()
                    .forEach((attrName) => {
                        
                        if (attrName.indexOf('@') === 0) {
                            const event = attrName.replace('@', '')
                            const elem = getElem(origin, childPath)
                            const code = elem.getAttribute(attrName)
                            //if (attrName === '@click') {
                            if (!code) return

                            getElem(parsed, childPath).addEventListener(
                                event,
                                ($event) => {
                                    const args = ['$event', code]
                                    const fn = Function.apply(null, args)
                                    //const fn = new Function(code).bind(this)
                                    fn.bind(this)($event)
                                }
                            )
                        }
                        //}
                    })

                if (getElem(origin, childPath).nodeName === '#text') {
                    const set = () => {
                        //console.error('setCalled', child.textContent)
                        const parsedTextContent = getElem(
                            origin,
                            childPath
                        ).textContent?.replace(/\{\{.+?}}/g, (match) => {
                            const scopeStr = match
                                .substr(2, match.length - 4)
                                .trim()

                            
                            //Check if there is instance of a class in the scope

                            if (
                                scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length
                            ) {
                                const args = ['$event', 'Input']
                                //const fn = Function.apply(null, args)
                                //const fn = new Function(code).bind(this)
                                const instance = new this.components['Input']()
                                instance.$$rootElement =
                                    getElem(parsed, childPath).parentElement ||
                                    document.createElement('<div></div>')
                                instance.mount()
                                return
                            } else {
                                return _.get(this.ctx, scopeStr)
                            }
                        })

                        if (parsedTextContent) {
                            getElem(
                                parsed as HTMLElement,
                                childPath
                            ).textContent = parsedTextContent
                        } else {
                            getElem(
                                parsed as HTMLElement,
                                childPath
                            ).textContent = ''
                        }
                    }

                    getElem(origin, childPath)
                        .textContent?.match(/\{\{.+?}}/g)
                        ?.forEach((match) => {
                            const scopeStr = match
                                .substr(2, match.length - 4)
                                .trim()
                            //Check if there is instance of a class in the scope
                            if (
                                scopeStr.match(/^(new)[\s]\w+[\s\S]+/)?.length
                            ) {
                            } else {
                                this.subscribs[scopeStr] = [
                                    ...(this.subscribs[scopeStr]
                                        ? this.subscribs[scopeStr]
                                        : []),
                                    () => {
                                        set()
                                        l++
                                    },
                                ]
                            }
                        })
                    set()

                }
                if (child instanceof HTMLElement) parse([...path, i])
            })
        }
 */
        //parse()

        // if (typeof this.template === "function") {
        //   this.$$template = this.template() || this.$$template;
        // }createStore

        phes.forEach((phe) => {
            //parsed
            //.querySelectorAll(k.toLowerCase())
            //.forEach((e: HTMLElement) => {
            //const phe = new PHEI()

            //var tmpObj = document.createElement('div')
            //tmpObj.innerHTML = '<!--THIS DATA SHOULD BE REPLACED-->'

            //const parent = e.parentNode as HTMLElement
            //parent.replaceChild(tmpObj, e)
            parsed.innerHTML = parsed.innerHTML.replace(
                `__$$__${phe.$id}__$$__`, //'<div><!--THIS DATA SHOULD BE REPLACED--></div>',
                `<div phid=${phe.$id}></div>`
            )

            ////e.outerHTML = `<div></div>`;
            const rootElement = parsed.querySelector(`[phid="${phe.$id}"]`)
            if (!rootElement || !(rootElement instanceof HTMLElement)) {
                return
            }
            phe.$$rootElement = rootElement

            phe.mount()
        })

        // parsed.querySelectorAll(`[text]`).forEach((el) => {
        //     const data = _.get(this.$$ctx, el.getAttribute('text'))
        //     switch (typeof data) {
        //         case 'string':
        //             el.textContent = data
        //             return
        //         case 'number':
        //             el.textContent = data.toString()
        //             return
        //         case 'object':
        //             el.textContent = '[obj]'
        //             return
        //         case 'undefined':
        //             el.textContent = ''
        //             return
        //         //el.textContent = typeof data === "string" ? data : data.toString();
        //     }
        // })

        if (this.$$rootElement) this.$$rootElement.appendChild(parsed)
    }
}

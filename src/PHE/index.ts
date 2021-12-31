import { PHD } from '../PHD'
import { DataNode, Document, Element } from 'domhandler/lib'
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

        const appendElFromTemplate = (
            htmlParentEl: HTMLElement,
            templateEl: Partial<Element | DataNode | Document>,
            scope: any = undefined
        ) => {
            let element: HTMLElement | Text // = document.createTextNode('')
            if (templateEl.type === ElementType.Root) {
                ;(templateEl as Document).children.forEach((child, index) => {
                    appendElFromTemplate(htmlParentEl, child, scope)
                })
                return
            } else if (
                templateEl.type === ElementType.Tag &&
                (templateEl as Element).name?.toLowerCase() === 'for'
            ) {
                const tEl = templateEl as Element
                element = document.createElement(tEl.name)

                if (tEl.name.toLowerCase() === 'for') {
                    const vars = tEl.attribs['exp']
                        .match(/[$](\w)+/g)
                        ?.join(',')

                    const set = () => {
                        ;(element as HTMLDivElement).innerHTML = ''

                        const args = ['appendElFromTemplate,tEl, elem', code]
                        const fn = Function.apply(null, args)
                        //const fn = new Function(code).bind(this)
                        try {
                            fn.bind(this)(appendElFromTemplate, tEl, element)
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    const exp = tEl.attribs['exp'].replace(
                        /this(.\w)+/,
                        ($propStr) => {
                            const propTrimmed = $propStr.replace(
                                'this.ctx.',
                                ''
                            )
                            //TODO REMOVE subscribes
                            this.subscribes[propTrimmed] = [
                                ...(this.subscribes[propTrimmed]
                                    ? this.subscribes[propTrimmed]
                                    : []),
                                () => {
                                    set()
                                },
                            ]
                            console.log('===', this.subscribes)
                            return $propStr.replace(/this./, 'that.')
                        }
                    )

                    const code = `
                            var that = this;
                            (function() {
                                
                                for( ${exp} ){
                                    tEl.children.forEach((tChild)=>{
                                        appendElFromTemplate(elem, tChild, {${vars}})
                                    })
                                }
                            })()`

                    set()
                }
            } else if (
                templateEl.type === ElementType.Tag &&
                (templateEl as Element).name
            ) {
                const tEl = templateEl as Element
                element = document.createElement(tEl.name)
                //const directives: string[] = []

                tEl.children.forEach((child, index) => {
                    /* if (child.type === ElementType.Directive) {
                        const el = child as DataNode
                        directives.push(el.data.slice(3, -1))

                        console.log('el', el)

                        //if(child.attribs['if']){
                        //    console.log(0,'IFFF')
                        //}

                        console.log(
                            's Element).children',
                            (tEl as Element).children
                        )
                        const args = [
                            'appendElFromTemplate,tEl, elem',
                            el.data.slice(3, -1) +
                                ' appendElFromTemplate(elem, tEl) }',
                        ]
                        console.log('el', el)
                        //const fn = Function.apply(null, args)
                        //const fn = new Function(code).bind(this)
                        //fn.bind(this)(appendElFromTemplate,tEl, elem)
                    } else { */
                    appendElFromTemplate(element as HTMLElement, child, scope)
                    //}
                })
                //console.log('directive', directives.join(''))
                if (tEl.attribs)
                    Object.entries(tEl.attribs).forEach(
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
                                    try {
                                        fn.bind(this)($event)
                                    } catch (e) {}
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
                                try {
                                    try {
                                        console.log('scopeStr', scopeStr)
                                        const res = new Function(
                                            'return ' + scopeStr
                                        ).bind(this)()
                                        if (res) {
                                            console.log('eval', res, scopeStr)
                                            return res
                                        }
                                    } catch (e) {}
                                    if (eval('scope.' + scopeStr)) {
                                        return eval('scope.' + scopeStr)
                                    }
                                } catch (e) {}
                                const get = (obj: any, strPath: string) => {
                                    return strPath
                                        .split('.')
                                        .reduce((acm, key) => {
                                            return obj[key]
                                        }, obj)
                                }
                                return get(this.ctx, scopeStr)
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
                        console.log(
                            'match',
                            scopeStr.match(/this.ctx(.\w){1,100}/g)
                        )
                        scopeStr.match(/this.ctx(.\w)+/g)?.forEach((item) => {
                            
                            item = item.replace(/this\.ctx\./, '')
                            this.subscribes[item] = [
                                ...(this.subscribes[item]
                                    ? this.subscribes[item]
                                    : []),
                                () => {
                                    set()
                                },
                            ]
                            console.log('-:-:-:-', item, this.subscribes)
                        })
                    }
                })

                set()
                //} else if (templateEl.type === ElementType.Directive) {
                // const el = templateEl as DataNode
                //element = document.createTextNode(el.data.slice(3, -1))
            } else {
                console.log('unknown el type', templateEl)
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

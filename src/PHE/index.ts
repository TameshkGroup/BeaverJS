import { PHD } from '../PHD'
import _ from 'lodash'

let l = 0

export type Item = PHE | null | undefined | string | number

function getElem(obj: HTMLElement, path: number[]) {
    console.log('obj path', obj, path)
    return path.reduce<HTMLElement>(
        (res, key) => res.childNodes?.[key] as HTMLElement,
        obj
    )
}

export function HTML(template: TemplateStringsArray, ...a: any[]): string {
    console.log(' HTML FMT items ', a, template)
    const s = template.reduce<string>((acm, str, i) => {
        console.log('i', i, 'length', str.length)
        return acm + str + (i < template.length - 1 ? String(a[i]) : '')
    }, '')
    return s
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
    constructor(private $$elementSelector?: string) {
        super()
        console.log('element constructor')
    }

    template(): string | void {}

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

    $$template: string = `<div></div>`

    render() {
        console.log('render1')

        this.$$template = this.template() || this.$$template

        let phes: PHE[] = []
        // const str = this.$$template.reduce<string>((acm, value) => {
        //     if (
        //         typeof value === 'string' ||
        //         typeof value === 'number' ||
        //         typeof value === 'bigint' ||
        //         typeof value === 'boolean'
        //     ) {
        //         return acm + String(value)
        //     }
        //     if (value instanceof PHE) {
        //         phes = [...phes, value]
        //         return acm + '__$$__' + value.$id + '__$$__'
        //     }
        //     return acm
        // }, '')

        const origin = new DOMParser().parseFromString(
            this.$$template,
            'text/html'
        ).body

        const parsed = origin.cloneNode(true) as HTMLElement

        const parse = (path: number[] = []) => {
            getElem(origin, path).childNodes.forEach((child, i) => {
                console.log('child', child, child.nodeName)
                let childPath = [...path, i]

                getElem(origin, childPath)
                    .getAttributeNames?.()
                    .forEach((attrName) => {
                        console.log(
                            "attrName.indexOf('@')",
                            attrName.indexOf('@')
                        )
                        if (attrName.indexOf('@') === 0) {
                            const event = attrName.replace('@', '')
                            const elem = getElem(origin, childPath)
                            const code = elem.getAttribute(attrName)
                            //if (attrName === '@click') {
                            console.log('code', code, event)
                            if (!code) return

                            getElem(parsed, childPath).addEventListener(
                                event,
                                ($event) => {
                                    const args = ['$event', code]
                                    const fn = Function.apply(null, args)
                                    //const fn = new Function(code).bind(this)
                                    console.log('fnres', fn.bind(this)($event))
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
                            const path = match
                                .substr(2, match.length - 4)
                                .trim()

                            // console.log(
                            //     'subscribes',
                            //     this.subscribs,
                            //     'this.ctx',
                            //     this.ctx
                            // )
                            return _.get(this.ctx, path)
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
                            const path = match
                                .substr(2, match.length - 4)
                                .trim()
                            this.subscribs[path] = [
                                ...(this.subscribs[path]
                                    ? this.subscribs[path]
                                    : []),
                                () => {
                                    console.log('__', l)
                                    set()
                                    l++
                                },
                            ]
                        })
                    set()

                    console.log('textNode', child.textContent)
                }
                if (child instanceof HTMLElement) parse([...path, i])
            })
        }

        parse()

        //console.log('parsed.childNodes', parsed.childNodes)

        console.log('parsed', parsed)

        // if (typeof this.template === "function") {
        //   this.$$template = this.template() || this.$$template;
        // }createStore

        phes.forEach((phe) => {
            //parsed
            //.querySelectorAll(k.toLowerCase())
            //.forEach((e: HTMLElement) => {
            //const phe = new PHEI()
            //console.log(' --- element', e)

            //var tmpObj = document.createElement('div')
            //tmpObj.innerHTML = '<!--THIS DATA SHOULD BE REPLACED-->'

            //const parent = e.parentNode as HTMLElement
            //parent.replaceChild(tmpObj, e)
            console.log('parsed.innerHTML', parsed.innerHTML)
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

            console.log('phe.$$rootElement', phe.$$rootElement)

            phe.mount()
            //console.log(' -- element', e.outerHTML, e)
            //})
        })

        //console.log('0', PHE.$$includedElems)

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

        // console.log('rootElement', this.$$rootElement)
        // console.log(
        //     'this.$$rootElement.innerHTML',
        //     this.$$rootElement.innerHTML
        // )
        if (this.$$rootElement) this.$$rootElement.appendChild(parsed)

        console.log('e', this.$$rootElement, 'mm')

        console.log('__ | __', this.$$rootElement)
    }
}

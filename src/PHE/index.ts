import { PHD } from '../PHD'
import _ from 'lodash'

type Item = PHE | null | undefined | string | number

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

export function HTML(input: TemplateStringsArray, ...args: any): Item[] {
    return input.reduce((acm, value, i) => {
        return [...acm, value, args[i]]
    }, [])
}

export class PHE extends PHD {
    static $$includedElems: Record<string, typeof PHE> = {}
    $$rootElement: HTMLElement
    constructor(private $$elementSelector?: string) {
        super()
    }

    template(): Item[] {
        return []
    }

    readonly ctx: Record<string, any>

    mounted() {}

    async mount() {
        await domReady()
        this.$$rootElement = document.querySelector(this.$$elementSelector) || this.$$rootElement;
        this.render()
        this.mounted()
    }

    $$template: Item[] = [] //`<div text="name"><div>1</div></div>`;

    render() {
        this.$$template = this.template() || this.$$template;

        let phes = []
        const str = this.$$template.reduce<string>((acm, value) => {
            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'bigint' ||
                typeof value === 'boolean'
            ) {
                return acm + String(value)
            }
            if (value instanceof PHE) {
                phes = [...phes, value]
                return acm + '__$$__' + value.$id + '__$$__'
            }
            return acm
        }, '')

        const parsed = new DOMParser().parseFromString(str, 'text/html').body

        //console.log('parsed', parsed.querySelectorAll('*'))

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
            console.log('parsed.innerHTML', parsed.innerHTML);
            parsed.innerHTML = parsed.innerHTML.replace(
                `__$$__${phe.$id}__$$__`, //'<div><!--THIS DATA SHOULD BE REPLACED--></div>',
                `<div phid=${phe.$id}></div>`
            )

            ////e.outerHTML = `<div></div>`;
            phe.$$rootElement = parsed.querySelector(`[phid="${phe.$id}"]`)

            

            console.log('phe.$$rootElement', phe.$$rootElement);

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
        if (this.$$rootElement) this.$$rootElement.innerHTML = parsed.innerHTML

        console.log('__ | __', this.$$rootElement)
    }
}

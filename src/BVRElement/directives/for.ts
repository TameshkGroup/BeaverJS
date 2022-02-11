import { Element } from 'domhandler/lib'
import { nanoid } from 'nanoid'
import BVRElement, { appendElFromTemplate } from '..'

export default class ForDirective {
    constructor(private bvrElement: BVRElement) {}

    static tagName = 'for'

    render(templateEl: Element, parentScopeId: string) {
        const tEl = templateEl as Element
        const element = document.createElement(tEl.name)

        const vars = tEl.attribs['exp'].match(/[$](\w)+/g)?.join(',')
        const exp = tEl.attribs['exp'].replace(/this(.\w)+/, ($propStr) => {
            const propTrimmed = $propStr.replace('this.', '')

            this.bvrElement.addSubscribe(propTrimmed, () => set(), parentScopeId)
            return $propStr.replace(/this./, 'that.')
        })
        const code = `
                    var that = this;
                    (function() {
                        for( ${exp} ){
                            tEl.children.forEach((tChild)=>{
                                appendElFromTemplate(those,elem, tChild, {${vars}}, scopeId)
                            })
                        }
                    })()`

        const args = ['appendElFromTemplate,those,tEl,elem,scopeId', code]

        let lastId: string | undefined
        const set = () => {
            if (lastId) {
                this.bvrElement.removeSubscribeByClass(lastId)
            }
            const $scopeId = nanoid(6)
            lastId = $scopeId
            ;(element as HTMLDivElement).innerHTML = ''

            try {
                const fn = Function.apply(null, args)

                fn.bind(this.bvrElement)(
                    appendElFromTemplate,
                    this.bvrElement,
                    tEl,
                    element,
                    $scopeId                )
            } catch (e) {
                console.error(e)
            }
        }

        set()
        return element
    }
}

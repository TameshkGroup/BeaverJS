import { getFromPath, setByPath } from '../../shared'
import { Element } from 'domhandler/lib'
import _ from 'lodash'
import BVRElement, { appendElFromTemplate } from '..'

export default class ComponentDirective {
    constructor(private bvrElement: BVRElement) {}

    static tagName = 'if'

    render(templateEl: Element, parentScopeId: string) {
        const tEl = templateEl as Element

        console.log('tEL', tEl, this.bvrElement)

        /* const element = document.createElement(tEl.name)

        const vars = tEl.attribs['exp'].match(/[$](\w)+/g)?.join(',')
        const exp = tEl.attribs['exp'].replace(/this(.\w)+/, ($propStr) => {
            const propTrimmed = $propStr.replace('this.ctx.', '')

            this.bvrElement.addSubscribe(propTrimmed, () => set(), parentScopeId)
            return $propStr.replace(/this./, 'that.')
        })
        const code = `
                    var that = this;
                    (function() {
                        if( ${exp} ){
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
                    $scopeId
                )
            } catch (e) {
                console.error(e)
            }
        }

        set(); */

        //element = document.createElement('div')

        //console.log('attribs', args)

        const fn = Function.apply(null, ['cmp', 'return new cmp(' + ')'])

        const cmp = this.bvrElement.$$elements?.[(templateEl as Element).name]

        //console.log('cmp', cmp.$$template)

        const instance = fn.bind(this.bvrElement)(cmp) as BVRElement
        instance.$$elements = this.bvrElement?.$$elements;
        instance.props = {}

        console.log('cmpInstance', instance)

        let el = instance.$$template
        const loop = (node: Partial<Element>, path: number[]) => {
            if (node.name === 'slot') {
                const slotName = node?.attribs?.['name'] || 'default'
                let filler

                console.log('node', node)
                ;(templateEl.children as (Partial<Element> & { children: Element })[]).forEach(
                    (child) => {
                        if (
                            child.type === 'tag' &&
                            child.name === 'filler' &&
                            (child.attribs?.slot
                                ? child.attribs?.slot === slotName
                                : slotName === 'default')
                        ) {
                            console.log('fillerIS1', child)
                            filler = child
                            /* console.log('fillerFond', child, path, instance.$$rootElement)
                            appendElFromTemplate(
                                this.bvrElement,
                                instance.$$rootElement?.children[1]?.children[5] as HTMLElement,
                                child
                            ) */
                        }
                    }
                )

                instance.$$slots = {
                    ...instance.$$slots,
                    [slotName]: {
                        templatePath: path,
                        filler,
                    },
                }
            }

            var nodes = node?.children as (Partial<Element> & { children: Element })[]
            for (var i = 0; i < (nodes?.length || 0); i++) {
                loop(nodes[i], [...path, i])
            }
        }

        loop(el, [])

        Object.entries((templateEl as Element).attribs).forEach(([k, v]) => {
            console.log('attribs', k)
            if (k.indexOf('@') === 0) {
                //TODO
                //@ts-ignore
                const event = k.replace('@', '')
                const code = k
                if (!code) return

                //TODO
                //@ts-ignore
                const fn = Function.apply(null, ['$event', code])
                /* instance.addEventListener(event, ($event) => {
                    try {
                        fn.bind(that)($event)
                    } catch (e) {}
                }) */
                // TODO
            } else if (k === '$') {
                const set = () => {
                    Function.apply(null, ['$', v]).bind(this.bvrElement)(instance)
                }

                v.match(/this(.\w){0,}/g)?.forEach((item) => {
                    item = item.slice(5) //item.replace(/this\./, '')
                    this.bvrElement.addSubscribe(item, set, parentScopeId)
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
                        const res = new Function('return ' + v).bind(this.bvrElement)()
                        instance.props[str] = res
                    } catch (e) {}
                }

                if (parentToChild) {
                    const set = () => {
                        instance.props[str] = Function.apply(null, ['', 'return ' + v]).bind(
                            this.bvrElement
                        )()
                    }

                    v.match(/this(.\w){0,}/g)?.forEach((item) => {
                        item = item.slice(5) //item.replace(/this\./, '')
                        this.bvrElement.addSubscribe(item, set, parentScopeId)
                    })

                    set()
                }

                if (childToParent) {
                    instance.addSubscribe('props.' + str, (value) => {
                        //DEEP Equality check
                        if (!_.isEqual(getFromPath(this.bvrElement, v.slice(5)), value)) {
                            //that[v.slice(5)] = value;
                            setByPath(this.bvrElement, v.slice(5), value)
                        }
                    })
                }
            }
        })

        instance.$$parent = this.bvrElement
        const element = document.createElement('div')
        //element.replaceChild(element,root)
        instance.$$rootElement = element
        //getElem(parsed, childPath).parentElement ||

        instance.mount()

        return element
    }
}

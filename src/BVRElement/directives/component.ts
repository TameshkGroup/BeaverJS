import { getFromPath, setByPath } from '../../shared'
import { Element } from 'domhandler/lib'
import _ from 'lodash'
import BVRElement from '..'

export default class ComponentDirective {
    constructor(private bvrElement: BVRElement) { }

    render(templateEl: Element, __: any, parentScopeId: string) {
        const fn = Function.apply(null, ['cmp', 'return new cmp(' + ')'])

        const cmp = this.bvrElement.$$elements?.[(templateEl as Element).name]

        const instance = fn.bind(this.bvrElement)(cmp) as BVRElement
        instance.$$element = cmp
        instance.$$elementName = (templateEl as Element).name
        instance.render()
        instance.$$elements = this.bvrElement?.$$elements
        instance.props = {}

        let el = instance.$$template

        /* Handle Slots */
        const findSlotsInTemplate = (node: Partial<Element>, path: number[]) => {
            if (node.name === 'slot') {
                const slotName = node?.attribs?.['name'] || 'default'
                let filler
                let nonFillerElements = [] as Element[]
                    ; (templateEl.children as Element[]).forEach((child) => {
                        if (
                            child.type === 'tag' &&
                            child.name === 'filler' &&
                            (child.attribs?.slot
                                ? child.attribs?.slot === slotName
                                : slotName === 'default') &&
                            !child.attribs['set.name']
                        ) {
                            filler = child
                        } else if (child.type === 'tag' && child.name === 'for') {
                            console.log('for found in slot')
                        } else if (child?.name !== 'filler' && !child.attribs?.['set.name']) {
                            if (
                                child.type !== 'text' ||
                                (child as any as Text).data.trim().replace(/\n/g, '') !== ''
                            ) {
                                nonFillerElements.push(child) //NONFiller element inside BVRElement
                            }
                        }
                    })
                if (!filler && slotName === 'default' && nonFillerElements?.length) {
                    filler = new Element('filler', { slot: 'default' }, nonFillerElements)
                }

                if (filler)
                    instance.$$slots = {
                        ...instance.$$slots,
                        [slotName]: {
                            templatePath: path,
                            filler,
                            scope: undefined,
                        },
                    }
            }

            var nodes = node?.children as (Partial<Element> & { children: Element })[]
            for (var i = 0; i < (nodes?.length || 0); i++) {
                findSlotsInTemplate(nodes[i], [...path, i])
            }
        }

        findSlotsInTemplate(el, [])
        /* End Handle Slots */

        /* Handle fillers without slot */
        const fillers: Element[] = []
        const nonFillerElements: Element[] = []
        const dynamicFillers: { elem: Element; scope: any }[] = []
            ; (templateEl.children as Element[]).forEach((child) => {
                if (child.type === 'tag' && child.name === 'filler') {
                    fillers.push(child)
                } else if (child.type === 'tag' && child.name.toLocaleLowerCase() === 'for') {
                    const slots = child.children.filter((child) => (child as Element).name === 'filler')
                    const vars = [
                        ...(child.attribs['exp']
                            .match(/(let|const|var)( |	|\n)+([a-zA-Z]|\$|_)+/g)
                            ?.map((v) => v.replace(/(let|const|var)( |	|\n)/g, '')) || []),
                    ]?.join(',')

                    const elems = Function.apply(null, [
                        'slots,those',
                        `
                    const elements = []
                    for(${child.attribs['exp']}){
                        elements.push(...slots.map((tChild)=>{
                            return {elem: tChild, scope: {${vars}}};//appendElFromTemplate(those, tChild, elem, {${vars}}, scopeId)
                        }))
                    }
                    return elements;
                `,
                    ]).bind(this.bvrElement)(
                        slots,
                        this.bvrElement,
                    )
                    elems.forEach(({ elem, scope }: { elem: Element; scope: any }) => {
                        dynamicFillers.push({ elem, scope: { ...scope } })
                    }
                    )
                } else {
                    if (
                        child.type !== 'text' ||
                        (child as any as Text).data.trim().replace(/\n/g, '') !== ''
                    ) {
                        nonFillerElements.push(child) //NONFiller element inside BVRElement
                    }
                }
            })
        if (nonFillerElements?.length && !instance.$$slots.default) {
            fillers.push(new Element('filler', { slot: 'default' }, nonFillerElements))
        }
        fillers.forEach((filler) => {
            instance.$$slots = {
                ...instance.$$slots,
                [filler.attribs?.slot || 'default']: {
                    filler,
                    templatePath: [],
                    scope: undefined,
                },
            }
        })
        /* End handle fillers without slot */
        console.log('$$slots', instance.$$slots)

        dynamicFillers.forEach((m) => {
            const { elem, scope } = m;
            const dynFillerName = elem.attribs?.['set.slot'];

            //TODO add subscriber for watching and applying changes if needed
            const fillerName = Function.apply(null, [
                `{${Object.keys(scope).join(',')}}`,
                `return ${dynFillerName}`,
            ]).bind(this.bvrElement)(scope)
            //delete elem.attribs['set.slot']
            //elem.attribs['slot'] = fillerName
            instance.$$slots = {
                ...instance.$$slots,
                [fillerName]: {
                    filler: elem,
                    templatePath: [],
                    scope,
                },
            }
        })


        /* Handle Attributes */
        Object.entries((templateEl as Element).attribs).forEach(([k, v]) => {
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
                if (k.indexOf('set.') === 0) {
                    const set = () => {
                        instance.props[k.replace('set.', '')] = Function.apply(null, [
                            '',
                            'return ' + v,
                        ]).bind(this.bvrElement)()
                    }

                    v.match(
                        /this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g
                    )?.forEach((item) => {
                        this.bvrElement.addSubscribe(item.substring(5), set, parentScopeId)
                    })

                    set()
                } else if (k.indexOf('bi.') === 0) {
                    const str = k.replace('bi.', '')

                    const set = () => {
                        instance.props[str] = Function.apply(null, ['', 'return ' + v]).bind(
                            this.bvrElement
                        )()
                    }

                    v.match(
                        /this\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*)(\.(([a-zA-Z]|_)+([a-zA-Z]|_|\d)*))*/g
                    )?.forEach((item) => {
                        this.bvrElement.addSubscribe(item.substring(5), set, parentScopeId)
                    })

                    set()

                    instance.addSubscribe('props.' + str, (value) => {
                        //DEEP Equality check
                        if (!_.isEqual(getFromPath(this.bvrElement, v.slice(5)), value)) {
                            //that[v.slice(5)] = value;
                            setByPath(this.bvrElement, v.slice(5), value)
                        }
                    })
                } else if (k.indexOf('get.') === 0) {
                    const str = k.replace('get.', '')

                    if (v.indexOf('=') >= 0) {
                        let assignment: { rhs: string; lhs: string } = {
                            rhs: v.slice(v.indexOf('=') + 1).trim(),
                            lhs: v.slice(0, v.indexOf('=')).trim(),
                        }
                        instance.addSubscribe('props.' + str, (v) => {
                            const value = Function.apply(null, [
                                '$',
                                'return ' + assignment.rhs,
                            ]).bind(this.bvrElement)(v)

                            //DEEP Equality check
                            if (
                                !_.isEqual(
                                    getFromPath(this.bvrElement, assignment.lhs.slice(5)),
                                    value
                                )
                            ) {
                                setByPath(this.bvrElement, assignment.lhs.slice(5), value)
                            }
                        })
                    } else {
                        instance.addSubscribe('props.' + str, (value) => {
                            //DEEP Equality check
                            if (!_.isEqual(getFromPath(this.bvrElement, v.slice(5)), value)) {
                                //that[v.slice(5)] = value;
                                setByPath(this.bvrElement, v.slice(5), value)
                            }
                        })
                    }
                }

                /* let childToParent = false
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
                } */
            }
        })

        instance.$$parent = this.bvrElement
        this.bvrElement.$$elementInstances[instance.$id] = instance
        const element = document.createElement('div')
        //element.replaceChild(element,root)
        instance.$$rootElement = element
        //getElem(parsed, childPath).parentElement ||

        instance.mount()

        return element
    }
}

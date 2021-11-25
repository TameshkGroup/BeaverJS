import { isArray, isObject } from '../shared'
import { nanoid } from 'nanoid'

export function first() {
    console.log('first(): factory evaluated')
    return function (target: any, propertyKey: string) {
        console.log('first(): called', target, propertyKey)
        // target[propertyKey] = Object.defineProperty(target.$$ctx, propertyKey, {
        //   get: () => target.$$ctx[propertyKey],
        //   set: (v) => (target.$$ctx[propertyKey] = v),
        // });
    }
}

export class PHD {
    render() {}
    $$ctx = {}
    $id: string
    constructor() {
        console.log('phd Contructor', this.$$ctx)
        Object.keys(this.$$ctx).forEach(($key) => {
            Object.defineProperty(this, $key, {
                get: function () {
                    this.$$ctx[$key]
                },
                set: function (v) {
                    this.$$ctx[$key] = v
                },
            })
        })
        this.$id = nanoid()
    }

    createStore(trigger: () => void) {
        return function store(obj: any, path: string[] = []) {
            Object.entries(obj).map(([k, p]) => {
                if (isObject(p) || isArray(p)) {
                    return store(obj[k], [k, ...path])
                }
            })

            return new Proxy(obj, {
                get: (target, p) => {
                    return target[p].value
                },
                set: (target, p, value) => {
                    if (p.toString().includes(':')) {
                        const t = p.toString().split(':')
                        if (target[p]) {
                            target[t[0]].triggers[t[1]] = value
                        } else {
                            target[t[0]].triggers = {
                                triggers: { [t[1]]: value },
                            }
                        }
                    } else if (p.toString().includes('~')) {
                        const t = p.toString().split('~')
                        if (target[p]) {
                            delete target[t[0]].triggers[t[1]]
                        }
                    } else if (target[p]) {
                        target.value = target[p].value
                    } else {
                        target[p] = { value, triggers: [] }
                    }
                    trigger()
                    console.log('obj[p] = value', path, obj, target)
                    return true
                },
            })
        }
    }

    readonly ctx: Record<string, any> = this.createStore(() => {
        console.log('trigger')
        this.render()
    })(this.$$ctx)

    //   new Proxy(this.$$ctx, {
    //     set: (obj, property, value) => {
    //       //TODO check access
    //       this.$$ctx[property] = value;
    //       this.render();
    //       return true;
    //     },
    //   });
}

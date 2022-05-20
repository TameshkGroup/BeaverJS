import { nanoid } from 'nanoid'
import _ from 'lodash'
import { getFromPath, isObject } from '../shared'

export type Value = any

export type SubscriptionValue = {
    fn: (value: Value, path: (string | number | symbol)[]) => void
    class?: string
    id: string
}

export function AsPuya<T extends new (...arg: any[]) => any>(
    target: T extends typeof Puya ? typeof Puya : typeof Puya
) {
    //let original: any = target;

    return class extends target {
        private $$context: any = {}

        //TODO
        //@ts-ignore
        setByPath = (path: string | string[], value: any, klass: string) => {
            // If not yet an array, get the keys from the string-path
            if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
            //@ts-ignore
            path.slice(0, -1).reduce(
                (
                    a,
                    c,
                    i // Iterate all of them except the last one
                ) =>
                    //@ts-ignore
                    Object(a[c]) === a[c] // Does the key exist and is its value an object?
                        ? // Yes: then follow that path
                          //@ts-ignore
                          a[c]
                        : // No: create the key. Is the next key a potential array-index?
                          //@ts-ignore
                          (a[c] =
                              Math.abs(Number.parseInt(path[i + 1])) >> 0 === +path[i + 1]
                                  ? [] // Yes: assign a new array object
                                  : {}), // No: assign a new plain object
                this.$$context
            )[path[path.length - 1]] = value // Finally assign the value to the last key
        }

        constructor(...args: any[]) {
            //@ts-ignore
            super(...args)

            const createHandler = <T extends Record<string | symbol, any>>(
                path: string[] = []
            ): ProxyHandler<T> => ({
                get: (target: T, key: keyof T): any => {
                    if (key == 'isProxy') return true
                    if (typeof target[key] === 'object' && target[key] != null)
                        return new Proxy(target[key], createHandler<any>([...path, key as string]))
                    return target[key]
                },
                set: (target: T, key: keyof T, value: any) => {
                    target[key] = value
                    this.$$subscribes['']?.forEach((subscribe) => {
                        subscribe.fn(this, [])
                    })

                    const propParts = [...path, key]

                    /* if (typeof propParts[0] === 'string') {
                        console.log(3, propParts[0])
                        this.$$subscribes?.[propParts[0]]?.forEach((subscribe) => {
                            try {
                                subscribe.fn(target)
                            } catch {}
                        })
                    } */

                    const findMatches = function (
                        keys: (string | number | symbol)[],
                        index: number
                    ): string[][] {
                        if (index === 0) return [['*'], [keys[index].toString()]]
                        const combPart = findMatches(keys, index - 1)
                        return combPart?.reduce<string[][]>((acm, item) => {
                            if (index < keys.length - 1) acm.push([...item, '*'])
                            acm.push([...item, keys[index].toString()])
                            return acm
                        }, combPart)
                    }

                    //console.log(1, 'pers', propParts, findMatches())

                    findMatches(propParts, propParts.length - 1).forEach((keyPath) => {
                        this.$$subscribes?.[keyPath.join('.')]?.forEach((subscribe) => {
                            if (keyPath.length - propParts.length >= 0) {
                                const value = getFromPath(
                                    target,
                                    propParts[keyPath.length - 1].toString() //Pick nth last of propParts
                                )
                                subscribe.fn(value, propParts.slice(0, keyPath.length))
                            } else {
                                subscribe.fn(target, propParts.slice(0, keyPath.length))
                            }
                        })
                    })

                    /* let acm = ''
                    for (let part of propParts.slice(1)) {
                        acm += (acm ? '.' : '') + (part as string)
                        console.log(2, (propParts[0] as string) + '.' + acm)
                        this.$$subscribes?.[(propParts[0] as string) + '.' + acm]?.forEach(
                            (subscribe) => {
                                const value = getFromPath(target, acm)
                                subscribe.fn(value)
                            }
                        )
                    } */

                    if (typeof value === 'object') {
                        //Setting object with its prop into a proxy prop
                        //console.log('Obj', propParts.join('.'))

                        //this just support first level of props
                        Object.keys(value).forEach((propName) => {
                            const nPropParts = [...propParts, propName]
                            console.log(
                                'prop matchers',
                                findMatches(nPropParts, nPropParts.length - 1)
                                    .filter((match) => match.length === nPropParts.length)
                                    .forEach((keyPath) => {
                                        this.$$subscribes?.[keyPath.join('.')]?.forEach(
                                            (subscribe) => {
                                                if (keyPath.length - nPropParts.length >= 0) {
                                                    const value = getFromPath(
                                                        target,
                                                        nPropParts[keyPath.length - 2].toString() +
                                                            '.' +
                                                            nPropParts[
                                                                keyPath.length - 1
                                                            ].toString() //Pick nth last of propParts
                                                    )
                                                    console.log(
                                                        -1,
                                                        value,
                                                        target,
                                                        nPropParts,
                                                        keyPath.length - 1
                                                    )
                                                    console.log(
                                                        -2,
                                                        keyPath.length - 1,
                                                        nPropParts[keyPath.length - 2].toString() +
                                                            '.' +
                                                            nPropParts[
                                                                keyPath.length - 1
                                                            ].toString()
                                                    )
                                                    subscribe.fn(
                                                        value,
                                                        nPropParts.slice(0, keyPath.length)
                                                    )
                                                } else {
                                                    subscribe.fn(
                                                        target[propName],
                                                        nPropParts.slice(0, keyPath.length)
                                                    )
                                                }
                                            }
                                        )
                                    })
                            )
                            /* this.$$subscribes?.[propParts.join('.') + '.' + propName]?.forEach(
                                (subscribe) => {
                                    const value = getFromPath(
                                        target,
                                        propParts[propParts.length - 1].toString() + '.' + propName
                                    )
                                    subscribe.fn(value, [...propParts, propName])
                                }
                            ) */
                        })
                    }
                    //console.log('subscribes', Object.keys(this.$$subscribes))

                    return true
                },
            })

            ;(
                Object.keys(this).filter(
                    //@ts-ignore
                    (key) => key[0] !== '$' && typeof this[key] !== 'function'
                ) as (keyof Puya)[]
            )?.forEach((prop) => {
                const prevValue = this[prop]
                if (this[prop]) {
                    this.$$context[prop] = this[prop]
                }

                Object.defineProperty(this, prop, {
                    get: () => {
                        return this.$$context[prop]
                    },
                    set: (value) => {
                        if (isObject(value)) {
                            this.$$context['$_' + prop] = value
                            this.$$context[prop] = new Proxy(
                                this.$$context['$_' + prop],
                                createHandler([prop])
                            )

                            //Setting object with its prop into a puya prop

                            //this just support first level of props
                            Object.keys(value).forEach((key) => {
                                this.$$context[prop][key] = value[key]
                            })
                        } else {
                            this.$$context[prop] = value
                        }

                        this.$$subscribes['']?.forEach((subscribe) => {
                            subscribe.fn(this, [])
                        })
                        this.$$subscribes[prop]?.forEach((subscribe) => {
                            subscribe.fn(value, [prop])
                        })
                    },
                    configurable: false,
                })

                if (isObject(this[prop])) {
                    this[prop] = this.$$context[prop]
                }
                //@ts-ignore
                this[prop] = prevValue
            })
        }
    } as any
}

export class Puya {
    $$subscribes: Record<string, SubscriptionValue[]> = {}

    addSubscribe(
        path: string,
        fn: (value: Value, path: (string | number | symbol)[]) => void,
        klass?: string,
        throttle?: number
    ): string
    addSubscribe(
        fn: (value: Value, path: (string | number | symbol)[]) => void,
        klass?: string,
        throttle?: number
    ): string

    addSubscribe(
        pathOrFn: string | ((value: Value, path: (string | number | symbol)[]) => void) = '',
        fnOrClass:
            | ((value: Value, path: (string | number | symbol)[]) => void)
            | string
            | undefined,
        klassOrThrottle?: string | number,
        throttle = 0
    ): string {
        if (typeof pathOrFn === 'string') {
            const path = pathOrFn
            const fn = fnOrClass as (value: Value) => void
            const klass = klassOrThrottle as string
            const id = nanoid(5)
            //('addSubscribe', path)
            this.$$subscribes[path] = [
                ...(this.$$subscribes[path] ? this.$$subscribes[path] : []),
                {
                    class: klass,
                    fn: throttle ? _.throttle(fn, throttle) : fn,
                    id,
                },
            ]
            return id
        } else {
            const fn = pathOrFn as (value: Value) => void
            const klass = fnOrClass as string
            throttle = klassOrThrottle as number
            const id = nanoid(5)
            this.$$subscribes[''] = [
                ...(this.$$subscribes[''] ? this.$$subscribes[''] : []),
                {
                    class: klass,
                    fn: throttle ? _.throttle(fn, throttle) : fn,
                    id,
                },
            ]
            return id
        }
    }

    removeSubscribeByClass(klass: string) {
        Object.keys(this.$$subscribes).forEach((key) => {
            this.$$subscribes[key] = this.$$subscribes[key].filter((s) => s.class !== klass)
        })
    }

    render() {}
    $$ctx: Record<string | symbol, any> = {}
    $id: string
    constructor() {
        this.$id = nanoid(5)

        const createHandler = <T extends Record<string | symbol, any>>(
            path: string[] = []
        ): ProxyHandler<T> => ({
            get: (target: T, key: keyof T): any => {
                if (key == 'isProxy') return true
                if (typeof target[key] === 'object' && target[key] != null)
                    return new Proxy(target[key], createHandler<any>([...path, key as string]))
                return target[key]
            },
            set: (target: T, key: keyof T, value: any) => {
                target[key] = value
                this.$$subscribes['']?.forEach((subscribe) => {
                    subscribe.fn(this, [])
                })
                this.$$subscribes[([...path, key].join('.'), [...path, '*'].join('.'))]?.forEach(
                    (subscribe) => {
                        subscribe.fn(value, [...path, key])
                    }
                )
                //console.log('subscribes', Object.keys(this.$$subscribes))
                return true
            },
        })

        setTimeout(() => {
            Object.values(this.$$beforeMountListeners).forEach((listener) => {
                if (typeof listener === 'function') listener()
            })
            this.beforeMount()
        }, 10)
    }

    $$beforeMountListeners: Record<string, () => void> = {}

    addBeforeMountListener(listener: () => void) {
        const key = nanoid(5)
        this.$$beforeMountListeners[key] = listener
        return key
    }

    beforeMount() {}
}

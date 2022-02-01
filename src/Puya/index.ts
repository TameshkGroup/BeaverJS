import { nanoid } from 'nanoid'
import _ from 'lodash'
import { isObject } from '../shared'

export type Value = any

export type SubscriptionValue = {
    fn: (value: Value) => void
    class?: string
    id: string
}

export function AsPuya<T extends new (...arg: any[]) => any>(
    target: T extends typeof Puya ? typeof Puya : typeof Puya
) {
    //let original: any = target;

    return class extends target {
        private $$context: any = {}

        constructor(...args: any[]) {
            //@ts-ignore
            super(...args)

            const createHandler = <T extends Record<string | symbol, any>>(
                path: string[] = []
            ): ProxyHandler<T> => ({
                get: (target: T, key: keyof T): any => {
                    if (key == 'isProxy') return true
                    if (typeof target[key] === 'object' && target[key] != null)
                        return new Proxy(
                            target[key],
                            createHandler<any>([...path, key as string])
                        )
                    return target[key]
                },
                set: (target: T, key: keyof T, value: any) => {
                    target[key] = value
                    this.$$subscribes['']?.forEach((subscribe) => {
                        subscribe.fn(this)
                    })
                    this.$$subscribes[[...path, key].join('.')]?.forEach(
                        (subscribe) => {
                            subscribe.fn(value)
                        }
                    )

                    return true
                },
            })

            ;(
                Object.keys(this).filter(
                    //@ts-ignore
                    (key) => key[0] !== '$' && typeof this[key] !== 'function'
                ) as (keyof Puya)[]
            )?.forEach((prop) => {
                if (this[prop]) {
                    this.$$context[prop] = this[prop]
                }
                /* try {
                    delete this[prop]
                } catch (e) {
                    console.error(e)
                } */

                /* if (isObject(this[prop])) {
                    this.$$context[prop] = this[prop];
                    this[prop] = new Proxy(this.$$context, createHandler([prop]))
                } else */
                Object.defineProperty(this, prop, {
                    get: () => {
                        /* console.log(
                            'getting',
                            prop,
                            this.$$context[prop],
                            this.$$context[prop].__isProxy
                        ) */
                        return this.$$context[prop]
                    },
                    set: (value) => {
                        //console.log('setting', prop, value)

                        if (isObject(value)) {
                            //this.$$context[prop] = value;
                            /* console.log(
                                'proxing',
                                this.$$context,
                                this.$$context[prop],
                                prop
                            ) */
                            this.$$context['$_' + prop] = value
                            this.$$context[prop] = new Proxy(
                                this.$$context['$_' + prop],
                                createHandler([prop])
                            )

                            //console.log(this.$$context[prop])
                            //@ts-ignore
                            //console.log(this.$$context[prop] && this.$$context[prop] instanceof Proxy)
                            //this.$$context[prop].x = 188
                        } else {
                            this.$$context[prop] = value
                        }

                        this.$$subscribes['']?.forEach((subscribe) => {
                            subscribe.fn(this)
                        })
                        this.$$subscribes[prop]?.forEach((subscribe) => {
                            subscribe.fn(value)
                        })
                    },
                    configurable: false,
                })

                if (isObject(this[prop])) {
                    this[prop] = this.$$context[prop]
                }
            })

            /* Object.defineProperty(this, 'unique', {
                value: true,
                configurable: false,
                writable: false
            }); */
        }
    } as any
}

export class Puya {
    $$subscribes: Record<string, SubscriptionValue[]> = {}

    addSubscribe(
        path: string,
        fn: (value: Value) => void,
        klass?: string,
        throttle?: number
    ): string
    addSubscribe(
        fn: (value: Value) => void,
        klass?: string,
        throttle?: number
    ): string

    addSubscribe(
        pathOrFn: string | ((value: Value) => void) = '',
        fnOrClass: ((value: Value) => void) | string | undefined,
        klassOrThrottle?: string | number,
        throttle = 0
    ): string {
        if (typeof pathOrFn === 'string') {
            const path = pathOrFn
            const fn = fnOrClass as (value: Value) => void
            const klass = klassOrThrottle as string
            const id = nanoid(5)
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
            this.$$subscribes[key] = this.$$subscribes[key].filter(
                (s) => s.class !== klass
            )
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
                    return new Proxy(
                        target[key],
                        createHandler<any>([...path, key as string])
                    )
                return target[key]
            },
            set: (target: T, key: keyof T, value: any) => {
                target[key] = value
                this.$$subscribes['']?.forEach((subscribe) => {
                    subscribe.fn(this)
                })
                this.$$subscribes[[...path, key].join('.')]?.forEach(
                    (subscribe) => {
                        subscribe.fn(value)
                    }
                )

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

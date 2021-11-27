import { nanoid } from 'nanoid'
import _ from 'lodash'

export type Value = any

export class PHD {
    subscribs: Record<string, ((value: Value) => void)[]> = {}

    render() {}
    $$ctx: Record<string | symbol, any> = {}
    $id: string
    constructor() {
        console.log('phd Contructor', this.$$ctx)
        this.$id = nanoid()

        const createHander = <T extends Record<string | symbol, any>>(
            path: string[] = []
        ): ProxyHandler<T> => ({
            get: (target: T, key: keyof T): any => {
                if (key == 'isProxy') return true
                if (typeof target[key] === 'object' && target[key] != null)
                    return new Proxy(
                        target[key],
                        createHander<any>([...path, key as string])
                    )
                return target[key]
            },
            set: (target: T, key: keyof T, value: any) => {
                console.log(`Setting ${[...path, key]} to: `, value)

                target[key] = value

                this.subscribs[[...path, key].join('.')]?.forEach(
                    (subscribe) => {
                        console.log('subscribe', subscribe)
                        subscribe(value)
                    }
                )

               
                return true
            },
            apply: (target: T, key: keyof T, value: any) => {
                console.log(-10, 'apply:', key, value, target)
            },
        })

        const p = new Proxy(this.$$ctx, createHander<typeof this.ctx>())

        this.ctx = p;

        setTimeout(() => {
            Object.values(this.beforeMountListeners).forEach((listener) => {
                if (typeof listener === 'function') listener()
            })
            this.beforeMount()
        }, 10)
        // const handler = {
        //     get(target: Record<string | symbol, any>, key: string | symbol) {
        //         if (key == 'isProxy') return true

        //         const prop = target[key]

        //         // return if property not found
        //         if (typeof prop == 'undefined') return

        //         // set value as proxy if object
        //         if (!prop.isProxy && typeof prop === 'object')
        //             target[key] = new Proxy(prop, handler)

        //         return target[key]
        //     },
        //     set(
        //         target: Record<string | symbol, any>,
        //         key: string | symbol,
        //         value: any
        //     ) {
        //         this.subscribs[[...keys, key].join('.')]?.forEach(
        //             (subscribe) => {
        //                 console.log('subscribe', subscribe)
        //                 subscribe(value)
        //             }
        //         )
        //         console.log(
        //             'Setting',
        //             target,
        //             `.${String(key)} to equal`,
        //             value
        //         )

        //         // todo : call callback

        //         target[key] = value
        //         return true
        //     },
        // }

        // this.ctx = new Proxy(this.$$ctx, handler)

        // const setCTX = () => {
        //     this.ctx = deepProxy(this.$$ctx, {
        //         set: (obj, key, value, root, keys) => {
        //             //if(root === rootObject);
        //             this.subscribs[[...keys, key].join('.')]?.forEach(
        //                 (subscribe) => {
        //                     console.log('subscribe', subscribe)
        //                     subscribe(value)
        //                 }
        //             )
        //             console.log(
        //                 9,
        //                 'proxySet',
        //                 [...keys, key].join('.'),
        //                 key,
        //                 value
        //             )
        //             //console.log('path', [...keys, key].join('.'))
        //             //console.log('setHandler', obj, key, value, root, keys)
        //             obj[key] = value
        //         },
        //         get: (obj, key, root, keys) => {
        //             //console.log('path', keys, key)
        //             return _.get(obj, key)
        //         },
        //     })

        //     //@ts-ignore
        //     Object.observe(this.ctx, (o: any) => {
        //         console.log('observe', o)
        //     })
        //     Object.values(this.beforeMountListeners).forEach((listener) => {
        //         if (typeof listener === 'function') listener()
        //     })
        //     this.beforeMount()
        // }
        //setTimeout(setCTX, 10)
    }

    ctx!: any //TODO

    beforeMountListeners: Record<string, () => void> = {}

    addBeforeMountListener(listener: () => void) {
        const key = nanoid()
        this.beforeMountListeners[key] = listener
        return key
    }

    beforeMount() {}
}

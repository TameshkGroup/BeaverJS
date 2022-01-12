/* import { Puya } from '../Puya'

const data = new Puya()

console.log(data.ctx)

data.ctx.m = 12

data.addSubscribe('m', (value) => {
    console.log('subscriber m', value)
})

data.addSubscribe((value) => {
    console.log('subscriber any', value)
})

data.addSubscribe('d', (value) => {
    console.log('subscriber d', value)
})

data.ctx.m = 13

data.ctx.d = 12

console.log('m:', data.ctx.m)
console.log('m:', data.ctx)
 */

const puyasProperties: Record<string, string[]> = {}
function puya() {
    console.log('target1')
    return function (target: Object, propertyKey: string) {
        if (!puyasProperties[target.constructor.name])
            puyasProperties[target.constructor.name] = []
        puyasProperties[target.constructor.name].push(propertyKey)
        //@ts-ignore
        console.log('target', target, propertyKey)
        Object.defineProperty(target, propertyKey, {
            get: () => {
                console.log('getting', 'mmm')
                return 'mmm'
            },
            set: (m: string) => {
                console.log('setting', m)
            },
        })
    }
}

class M {
    constructor() {
        puyasProperties[this.constructor.name].forEach(() => {
            /* Object.defineProperty(this.constructor.prototype, prop, {
                get: () => {
                    //@ts-ignore
                    console.log('getting', prop, this['$$' + prop])
                    //@ts-ignore
                    return this['$$' + prop]
                },
                set: (value) => {
                    console.log('setting', prop, value)
                    //@ts-ignore
                    this['$$' + prop]
                },
            }) */
        })
    }
}

function Puya() {
    return function (m: M) {
        //@ts-ignore
        //@ts-ignore
        console.log('mmmm', m, m.constructor.name)

        puyasProperties[m.constructor.name].forEach((propertyKey) => {
            Object.defineProperty(m, propertyKey, {
                get: () => {
                    console.log('getting', 'mmm')
                    return 'mmm'
                },
                set: (m: string) => {
                    console.log('setting', m)
                },
            })
        })
    }
}

@Puya()
class Mo extends M {
    @puya()
    test?: string
}
const m = new Mo()
const n = new Mo()
n.test = '3'
console.log('n.test', n.test, m.test)

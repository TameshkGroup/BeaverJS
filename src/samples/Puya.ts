import _ from 'lodash'
import { AsPuya, Puya } from '../Puya/index'
//import { puya } from '../Puya'

@AsPuya
class Mo extends Puya {
    m?: string
    test?: { x?: number | { y: number } }
}

const m = new Mo()
const n = new Mo()
/* n.addSubscribe('test.x', (value) => {
    console.log('x changed', value)
}) */
m.addSubscribe('test.x.y', (value, path) => {
    console.log(
        'm test.x.y changed',
        value,
        typeof m.test?.x !== 'number' ? m.test?.x?.y : undefined,
        path
    )
})
m.addSubscribe('*.x', (value, path) => {
    console.log('m *.x changed', value, m.test?.x, path)
})
m.addSubscribe('test.*.y', (value, path) => {
    console.log(
        'm test.*.y changed',
        value,
        typeof m.test?.x !== 'number' ? m.test?.x?.y : undefined,
        path
    )
})
m.addSubscribe('*.x.y', (value, path) => {
    console.log('m *.x.y changed', value, typeof m.test?.x !== 'number' ? m.test?.x?.y : undefined, path)
})
/* 
n.addSubscribe('test', (value, path) => {
    console.log('test changed', value, n.test, path)
})

m.addSubscribe('test.*.y', (value, path) => {
    console.log('m test.*.y', value, path)
}) */

n.test = {}
n.test.x = 13
n.test.x = 12
n.test.x = 11
n.test = { x: 19 }

n.test.x = 20
console.log('m is', _.cloneDeep(m))
m.test = {}
console.log(1, 'm.test.x = 6')
m.test.x = 6
console.log(2, 'm.test.x = { y: 10 }')
m.test.x = { y: 10 }
console.log(3, 'm.test.x.y = 11')
m.test.x.y = 11

console.log('n.test', n.test, m.test)
//n.test = { x: 12 }
console.log('n.test', n.test, m.test)

import { App } from './App'
import { HTML, PHE } from './PHE'
import { Element } from './PHE/decorators'

@Element(App)
export default class Input extends PHE {
    constructor() {
        super()
        console.log('-- this constructor invoked --')
    }

    mounted() {
        this.ctx.name = 'ok'
        // let counter = 0
        this.ctx.counter = 0
        // setInterval(() => {
        //     this.ctx.counter = counter
        //     counter++
        // }, 1000)
    }

    template() {
        return HTML`<pre>${this.ctx.counter}</pre>`
    }
}

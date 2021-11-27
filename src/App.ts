import { HTML, PHE } from './PHE'
import _ from 'lodash'


export class App extends PHE {
    constructor(elementSelector: string) {
        super(elementSelector)
        console.log(-1, 'constructor')
        //this.$$ctx.name = "ok";
    }
    $$ctx = {}

    // declare ctx: {
    //     obj: { c: { d: number } },
    //     c: number
    // }

    template() {
        //console.log(1, 'template requested')
        return HTML`
        <div @click="this.reset()" style="width: 100px; height: 20px; background-color: green;color:white">
            {{obj.c.d}}
            <span>{{c}}</span>
            {{obj.c.d}}
        </div>`
    }

    reset() {
        this.ctx.obj.c.d = 0
    }

    beforeMount() {
        console.log(0, 'before mount')
        console.log('beforeMount', 'App')
        this.ctx.obj = { c: { d: 1 } }
    }

    mounted() {
        //console.log('$$ctx', this.$$ctx)
        //console.log('111ctx', this.ctx)
        //this.ctx.name = "name1";
        //this.ctx.obj = {}
        //console.log(' $$ctx: 1 ', this.$$ctx.obj.c.d)
        //console.log(' ctx:   1 ', this.ctx.obj.c.d)
        //this.ctx.obj = { c: { d: 3 } }
        this.ctx.c = 1
        console.log(' $$ctx: 2 ', this.ctx.obj.c.d)
        console.log(' ctx:   2', this.ctx.c) //this.ctx.obj.c.d)

        //this.ctx.watch('ok')

        this.ctx.c = 2
        //this.ctx.obj.c.d = 12
        console.log(' ctx:   3', this.ctx.c) // this.ctx.obj.c.d)

        this.ctx.obj.c.d++
        let counter = this.ctx.obj.c.d
        // setInterval(() => {
        //     counter++

        //     //this.ctx.counter = counter
        //     //console.log('counter', this.ctx.obj.c)
        //     //if (this.ctx.obj.c) this.ctx.obj.c.d = counter * 2
        //     this.ctx.obj.c.d = counter
        //     //console.log('$$ctx1', this.$$ctx, this.ctx)
        // }, 1000)
    }
}

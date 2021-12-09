import { HTML, PHE } from './PHE'
import _ from 'lodash'
import Input from './Input'
var m = {};


export default class App extends PHE {
    components = { Input }

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
        <div
            tabindex="1"
            @click="this.reset(); console.log('$event',$event)"
            @mouseMove="console.log($event); this.ctx.c = $event.clientX; this.ctx.x = $event.clientX; this.ctx.y = $event.clientY"
            @mouseEnter="this.reset(); console.log('event',event)" 
            @mouseLeave="this.ctx.c = 10"
            @keydown="this.ctx.c = 40"
            style="width: 700px; height: 500px; background-color: green;color:white"
        >
            {{x}}
            <span>{{y}}</span>
            {{obj.c.d}}
            
            <div>{{new Input()}}</div>
        </div>
        
        `
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

import { HTML, PHE } from './PHE'
import _ from 'lodash'
import Input from './Input'

export default class App extends PHE {
    components = { Input }

    constructor(m: string) {
        super(m)
        this.ctx.arr = [
        ]
        setInterval(() => {
            this.ctx.arr = [...this.ctx.arr, 4]
        }, 1000)

        setTimeout(() => {
            this.ctx.arr = [...this.ctx.arr, 5]
        }, 2000)
    }

    template() {
        //console.log(1, 'template requested')
        return HTML`
        <div
            tabindex="1"
            @click="this.reset(); console.log('$event',$event)"
            @mouseMove="this.ctx.c = $event.clientX; this.ctx.x = $event.clientX; this.ctx.y = $event.clientY"
            @mouseEnter="this.reset(); console.log('event',event)" 
            @mouseLeave="this.ctx.c = 10"
            @keydown="this.ctx.c = 40"
            style="width: 700px; height: 500px; background-color: green;color:white"
        >

        -- {{ JSON.stringify({length: Object.values(this.subscribes['arr']).length, arr: this.ctx.arr}) }} --
        <br />
            {{this.ctx.x}}
            <span>{{this.ctx.y}}</span>
            {{this.ctx.obj.c.d}}
            
            <if exp='this.ctx.obj.c.d === 10'>
                
                <div>{{new Input()}}</div>
            </if>
            
            <for exp='var $j = 10; $j <= 20; $j+= 2'>
                <div>item {{$j}}</div>
            </for>

            
            <for exp='var $j in this.ctx.arr'>
                <div>item {{this.ctx.arr}} __ {{this.ctx.x}}</div>
            </for>
            {{JSON.stringify(this.ctx.arr)}}
            <div>ad</div>
        </div>
        <button @click="this.ctx.arr = [1,2,3]">Set 1,2,3</button>
        <button @click="console.log('subscribes',this.subscribes)">Log Subscribes</button>
        `
    }
}

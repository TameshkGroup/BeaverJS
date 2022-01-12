import { HTML, PHE } from './PHE'
import _ from 'lodash'
import Input from './Input'

export default class App extends PHE {
    components = { Input }

    constructor(m: string) {
        super(m)
        this.ctx.arr = _.range(0, 1000)
        this.subscribes['']
    }

    template() {
        //console.log(1, 'template requested')
        return HTML`
        <input @input="x = $event.target.value" />
        <div
            tabindex="1"
            @click="this.reset(); console.log('$event',$event)"
            @mouseMove="this.ctx.x = $event.clientX; this.ctx.y = $event.clientY"
            style="background-color: black;color:white; height: 100%"
        >   
            <if exp="this.ctx.y > 100" >
                <div style="background: red; width: 100px; height: 100px;">
                </div>
            </if>
            <if exp="this.ctx.y <= 100">
                <div style="background: blue; width: 100px; height: 100px;">
                </div>
            </if>
            <for exp='var $j in this.ctx.arr'>
                <div>x:{{this.ctx.x}}(1000)</div>
                <div>y:{{this.ctx.y}}(1000)</div>
            </for>
        </div>
        <div id="ok">
            <style>
                #ok{
                    width: 100px;
                    height: 100px;
                    background: red;
                    position: absolute;
                    left: {{this.ctx.x}}px;
                }
            </style>
            <style>
                #ok{
                    top: calc(100px + {{this.ctx.y}}px);
                }
            </style>
        </div>
        <button @click="this.ctx.arr = [1,2,3]">Set 1,2,3</button>
        <button @click="console.log('subscribes',this.subscribes)">Log Subscribes</button>
        `
    }
}

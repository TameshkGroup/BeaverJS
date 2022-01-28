import { HTML, PHE } from './PHE'
import _ from 'lodash'
import { AsPuya } from './Puya';
import Input from './Input'
@AsPuya
export default class App extends PHE {
    $$components = { Input }

    arr: number[] = [];
    x: Number = 0;
    y: Number = 0;

    template() {
        //console.log(1, 'template requested')
        return HTML`
        <input @input="this.x = $event.target.value" />
        {{this.x}}
        <div
            tabindex="1"
            @click="this.reset(); console.log('$event',$event)"
            @1mouseMove="this.x = $event.clientX; this.y = $event.clientY"
            style="background-color: black;color:white; height: 100%"
        >   
            <if exp="this.y > 100" >
            <div style="background: red; width: 100px; height: 100px;">
            </div>
            </if>
            <if exp="this.y <= 100">
            <div style="background: blue; width: 100px; height: 100px;">
            </div>
            </if>
            <for exp='var $j in this.arr'>
            <div>x:{{this.x}}</div>
            <div>y:{{this.y}}</div>
            </for>
            {{new Input()}}
        </div>
        <div id="ok">
            <style>
                #ok{
                    width: 100px;
                    height: 100px;
                    background: red;
                    position: absolute;
                    left: {{this.x}}px;
                    top: calc(100px + {{this.y}}px);
                }
            </style>
        </div>
        <button @click="this.arr = [1,2,3]">Set 1,2,3</button>
        <button @click="console.log('subscribes',this.$$subscribes)">Log Subscribes</button>
        `
    }
}

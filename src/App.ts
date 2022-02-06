import { HTML, PHE } from './PHE'
import _ from 'lodash'
import { AsPuya } from './Puya';
import Input from './Input'

@AsPuya
export default class App extends PHE {
    $$components = { input: Input }

    arr: number[] = _.range(1, 20);
    x: number = 0;
    y: number = 0;

    template() {
        return HTML`
        <div
            tabindex="1"
            @click="this.reset(); console.log('$event',$event)"
            @mouseMove="this.x = $event.clientX; this.y = $event.clientY"
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
                <Input x{}='$j' y{}='this.x' />
            </for>
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

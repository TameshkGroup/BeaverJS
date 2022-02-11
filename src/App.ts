import BVRElement, { html } from './BVRElement'
import _ from 'lodash'
import { AsPuya } from './Puya'
import TextInput from './TextInput'

@AsPuya
export default class App extends BVRElement {
    $$elements = { TextInput }

    constructor() {
        super()
        console.log('template', this.$$rootElement)
    }

    value = 'va'

    arr: number[] = _.range(1, 3)
    x: any //{x: 12};
    y: number = 100
    beforeMount(): void {
        this.x = { x: 10 }
    }

    async mounted() {
        this.x.x = 13
    }
    checked = true;

    template() {
        return html`
            <div
                tabindex="1"
                @click="this.reset(); console.log('$event',$event)"
                @mouseMove="//this.x.x = $event.clientX; this.y = $event.clientY;"
                style="background-color: black;color:white; height: 100%"
            >
                {{this.checked}}
                <input type="checkbox" checked{}="this.checked"/>
                <if exp="this.y > 100">
                    <div style="background: red; width: 100px; height: 100px;"></div>
                </if>
                <if exp="this.y <= 100">
                    <div style="background: blue; width: 100px; height: 100px;"></div>
                </if>
                {{this.x.x}} {{this.y}}
                <div>--{{JSON.stringify(this.x)}}--</div>
                {{this.value}}
                <for exp="var $j in this.arr">
                    <TextInput value}="this.y" $="$.props.value = this.y" />
                    <TextInput value}="this.x.x" $="$.props.value = this.x.x" />
                </for>
            </div>
            <div id="ok">
                <style>
                    #ok{
                        width: 100px;
                        height: 100px;
                        background: red;
                        position: absolute;
                        left: {{this.x.x}}px;
                        top: calc(100px + {{this.y}}px);
                    }
                </style>
            </div>
            <button @click="this.arr = [1,2,3]">Set 1,2,3</button>
            <button @click="console.log('subscribes',this.$$subscribes)">Log Subscribes</button>
        `
    }
}

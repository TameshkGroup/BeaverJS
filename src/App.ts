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

    arr: number[] = _.range(1, 5)
    x: any
    y: number = 100
    beforeMount(): void {
        this.x = { x: 10 }
    }

    async mounted() {
        this.x.x = 13
        console.log('log', this.$$subscribes)
    }

    checked = true
    
    _ = _

    template() {
        return html`
            <div
                tabindex="1"
                @click="this.reset(); console.log('$event',$event)"
                @mouseMove="//this.x.x = $event.clientX; this.y = $event.clientY;"
                style="background-color: black;color:white; height: 100%"
            >
                {{this.checked}} {{ this.checked?100:200 }}
                <br />
                <input type="checkbox" checked{}="this.checked" />
                <if exp="this.checked">
                    11
                    <div style="background: blue; width: 100px; height: 100px;"></div>
                    <if exp="this.x.x > 10"> mm </if>
                    <TextInput bi.value="this.x.x" />
                </if>
                <for exp="i in this._.range(0,10)">
                    <div>{{i}}</div>
                </for>
                <input value{="this.checked ?100:200" value}="this.x.x" />

                {{this.x.x}} {{this.y}}
                <div>--{{JSON.stringify(this.x)}}--</div>
                {{this.value}}
                <TextInput set.value="this.checked ?100:200" get.value="this.x.x">
                    <filler>
                        The Filler
                        <div>aa</div>
                        <TextInput set.value="this.x.x" get.value="this.x.x = Number.parseInt($)">
                            <filler slot="prepend"> prepend1 {{JSON.stringify(this.x)}} </filler>
                            <filler> defult {{this.x.x}} </filler>
                        </TextInput>
                    </filler>
                </TextInput>
                <TextInput get.value="this.y" set.value="this.y"></TextInput>

                <if exp="this.x.x > 10">
                    <for exp="let $j in this.arr">
                        1 {{$j}}
                        <if exp="$j < 2"> m </if>
                        <if exp="$j >= 2"> n </if>
                    </for>
                </if>
            </div>

            <div id="ok">
                <style>
                    #ok{
                        width: 100px;
                        height: 100px;
                        background: red;
                        position: absolute;
                        left: {{this.x.x + 100}}px;
                        top: calc(100px + {{this.y}}px);
                    }
                </style>
            </div>
            <button @click="this.arr = [1,2,3]">Set 1,2,3</button>
            <button @click="console.log('subscribes',this.$$subscribes)">Log Subscribes</button>
        `
    }
}

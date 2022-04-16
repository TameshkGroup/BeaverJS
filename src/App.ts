import BVRElement, { html } from './BVRElement'
import _ from 'lodash'
import { AsPuya } from './Puya'
import TextInput from './TextInput'
import CheckInput from './CheckInput'

@AsPuya
export default class App extends BVRElement {
    $$elements: Record<string, Constructor<BVRElement>> = { TextInput, CheckInput }

    value = 'value'

    arr: number[] = _.range(1, 2)
    x: any
    y: number = 100
    beforeMount(): void {
        this.x = { x: 10 }
    }

    async mounted() {
        this.x.x = 13
    }

    checked = true

    _ = _

    template() {
        return html`
            1
            <div
                tabindex="1"
                @click="this.reset(); console.log('$event',$event)"
                @mouseMove="this.x.x = $event.clientX; this.y = $event.clientY;"
                style="background-color: black;color:white; height: 70%"
            >
                <CheckInput set.value="this.checked" get.value="this.checked" set.label="'label'"></CheckInput>
                <br />
                {{this.checked}}
                <input type="checkbox" checked{}="this.checked" />
                <if exp="this.checked">
                    <div style="background: blue; width: 100px; height: 100px;"></div>
                    <if exp="this.x.x > 10"> {__}111 </if>
                    <TextInput bi.value="this.x.x"></TextInput>
                </if>
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
                        11
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
            ____++
            <button @click="this.arr = [1,2,3]">Set 1,2,3</button>
            <button @click="console.log('subscribes',this.$$subscribes)">Log Subscribes</button>
        `
    }
}

/* if (import.meta.hot) {
    import.meta.hot.accept((accept) => {
        console.log('aai', { accept })
    })
    import.meta.hot.accept('./TextInput', (accept) => {
        console.log('a1', { accept })
    })
    import.meta.hot.on('vite:beforeUpdate', (payload) => {
        console.log('vite:beforeUpdate', payload)
    })
    import.meta.hot.accept((newModule) => {
        console.log('updated: count is now ')
        console.log('n', newModule)
    })
    import.meta.hot.on('special-update', (su) => {
        console.log('specialUpdate', su)
    })
} */

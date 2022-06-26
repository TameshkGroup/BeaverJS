import { BVRElement, html, AsPuya } from '.'
import _ from 'lodash'
import Collapse from './components/Collapse'

@AsPuya
export default class App extends BVRElement {
    $$elements = { Collapse }
    test = 'ok'
    arr = _.range(0, 10)
    inputValue? = 12
    check = false

    async mounted() {
        this.inputValue = 13
        document.title = 'BVR.JS'
    }

    inputChanged(value: string) {
        const parsed: number | undefined = Number.parseInt(value)
        this.inputValue = isNaN(parsed) ? undefined : parsed
    }

    template() {
        return html`<div>run</div>
            {{ this.test }}
            <for exp="let $i of this.arr">
                <div>{{$i}}</div>
            </for>
            <br />
            <div>{{ this.inputValue }}</div>
            <if exp="this.arr.length > 10"> larger </if>

            <NumberInput bi.value="this.inputValue">
                <filler slot="prefix">111</filler>
                <p></p>
            </NumberInput>
            <button @click="this.arr.push(this.inputValue)">add</button>
            <br />
            <Collapse>
                <filler slot="title-12"> Third </filler>
                <filler slot="title-13"> Forth </filler>
                <filler slot="content-12"> Third content </filler>
                <filler slot="content-13"> Forth content </filler>
                <for exp="let j of this.arr">
                    <filler set.slot="'content-' + j"> Dyn Content {{i}} <input set.value="i" @input="console.log('$', $.value)" /> </filler>
                    <filler set.slot="'title-' + j"> Dyn Header {{i}} </filler>
                </for>
            </Collapse>

            <input set.value="this.inputValue" get.input="this.inputValue = $.value" type="text" />
            <br />
            {{this.check}}
            <input set.checked="this.check" @input="this.check = $.checked" type="checkbox" />
            <input set.checked="this.check" @input="this.check = $.checked" type="checkbox" /> `
    }
}

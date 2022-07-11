import { BVRElement, html, AsPuya } from '.'
import _ from 'lodash'
import Collapse from './components/Collapse'
import CheckInput from './components/CheckInput'
import RadioGroup from './components/RadioGroup'
import Radio from './components/Radio'
import Iconify from '@iconify/iconify'
Iconify;

@AsPuya
export default class App extends BVRElement {
    $$elements = { Collapse, CheckInput, RadioGroup, Radio }
    arr = []
    inputValue? = 12
    check = true
    radio = true

    async mounted() {
        this.inputValue = 13
        document.title = 'BVR.JS'
    }

    inputChanged(value: string) {
        const parsed: number | undefined = Number.parseInt(value)
        this.inputValue = isNaN(parsed) ? undefined : parsed
    }

    template() {
        return html`
            OK
            <for exp="let $i of this.arr">
                <div>{{$i}}</div>
            </for>
            Turn
            <CheckInput bi.value="this.check">OK</CheckInput>
            <RadioGroup>
                <Radio bi.value="this.radio">First Option</Radio>
                {{this.radio}}1
            </RadioGroup>
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
                    <filler set.slot="'content-' + j">
                        Dyn Content {{i}} <input set.value="i" @input="console.log('$', $.value)" />
                    </filler>
                    <filler set.slot="'title-' + j"> Dyn Header {{i}} </filler>
                </for>
            </Collapse>

            <input set.value="this.inputValue" get.input="this.inputValue = $.value" type="text" />
            <br />
            {{this.check}}
            <input set.checked="this.check" @input="this.check = $.checked" type="checkbox" />
            <input set.checked="this.check" @input="this.check = $.checked" type="checkbox" />
        `
    }
}

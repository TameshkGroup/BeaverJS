import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'
import CheckInput from './CheckInput'

@AsPuya
export default class TextInput extends BVRElement {
    $$elements = { CheckInput }

    value = 0
    click?: () => void = () => {
        console.log('clicked')
    }

    mounted(): void {
        setInterval(() => {
            this.value += 1
        }, 1000)
    }

    $$template = html`
        <div>
            <slot name="prepend"></slot>
            <input
                @input="this.props.value = $event.target.value"
                $="$.setAttribute('ok', this.props.value); $.value = this.props.value"
            />
            <slot></slot>
            <button @click="this.click()">Click</button>
        </div>
    `
}

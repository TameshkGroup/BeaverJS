import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'
import CheckInput from './CheckInput'

@AsPuya
export default class NumberInput extends BVRElement {
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
        <div
            style="border: 1px #efefef solid;background: #fefefe;display: inline-block;  border-radius: 8px"
        >
            <div style="display: flex;">
                <IF exp="this.$$slots.prepend">
                    <div style="padding: 6px">
                        <slot name="prepend"></slot>
                    </div>
                </IF>
                <input
                    style="border: none;outline: none; background: none; margin: 6px"
                    @input="this.props.value = $event.target.value"
                    $="$.setAttribute('ok', this.props.value); $.value = this.props.value"
                />
                <div style="padding: 6px">
                    <slot name="append"></slot>
                </div>
            </div>
        </div>
    `
}

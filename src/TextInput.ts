import BVRElement, { html } from './BVRElement'
import { AsPuya } from './Puya'

@AsPuya
export default class TextInput extends BVRElement {
    value = '';
    click?: () => void;

    mounted(): void {
        this.value += '1'
    }


    $$template = html`
        <div>
            <slot name="prepend"></slot>
            <button @click="this.value++">Bt{{this.value}}</button>
            <input
                @input="this.props.value = $event.target.value"
                $="$.setAttribute('ok', this.props.value); $.value = this.props.value"
            />
            <slot></slot>
        </div>
    `
}

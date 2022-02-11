import BVRElement, { html } from './BVRElement'
import { AsPuya } from './Puya'

@AsPuya
export default class TextInput extends BVRElement {
    value = '';
    click?: () => void;


    $$template = html`
        <div>
            <button @click="ok">Btn</button>
            <input
                @input="this.props.value = $event.target.value"
                $="$.setAttribute('ok', this.props.value); $.value = this.props.value"
            />
        </div>
    `
}

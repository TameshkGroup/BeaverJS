import BVRElement, { html } from '../BVRElement'
import { AsPuya, Puya } from '../Puya'

@AsPuya
class M extends Puya {
    variable?: string
}

@AsPuya
export default class RadioGroup extends BVRElement {
    value: any

    m = new M()

    mounted() {
        this.provide(this.value)
        setTimeout(() => {
            this.value = 'ok'
        }, 1000)
        this.m.variable = '_____'
        setInterval(() => {
            this.m.variable += '+'
        }, 1000)
    }

    $$template = html`
        <div>
            <slot></slot>
        </div>
    `
}

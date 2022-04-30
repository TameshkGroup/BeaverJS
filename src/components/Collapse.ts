import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
        console.log('collapseSlots', this)
    }

    $$template = html`<div class="collapse">
            <IF exp="true">
                <FOR
                    exp="let ij of Object.keys(this.$$slots).filter(i => i.indexOf('content') == 0)"
                >
                    -{{ij}}-
                    <div style="border: 1px solid #febebe">
                        <slot set.name="ij"></slot>
                    </div>
                </FOR>
            </IF>
            OK00
        </div>

        <style>
            .collapse {
                border: 1px solid #bebebe;
            }
        </style> `
}

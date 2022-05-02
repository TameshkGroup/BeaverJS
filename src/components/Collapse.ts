import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
        console.log('collapseSlots', this)
        setTimeout(() => {
            this.x = 200
        }, 3000)

        for(let i = 0; i< 100 ;i++){

        }
    }

    x = 100

    $$template = html`<div class="collapse">
            {{this.x}}
            <slot name="danial"></slot>
            <IF exp="this.x === 100"> Is one hundred </IF>
            <IF exp="this.x === 200">Is two hundred</IF>
            <IF exp="true">
                <FOR exp="let slotName of Object.keys(this.$$slots)">
                    -{{slotName}}-
                    <div style="border: 1px solid #febebe">
                        <slot set.name="slotName"></slot>
                    </div>
                </FOR>
            </IF>
        </div>

        <style>
            .collapse {
                border: 1px solid #bebebe;
            }
        </style> `
}

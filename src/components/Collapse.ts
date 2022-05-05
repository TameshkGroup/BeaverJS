import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
        setTimeout(() => {
            this.x++
        }, 100)

        for (let i = 0; i < 100; i++) {

        }
    }

    x = 100

    $$template = html`<div class="collapse">
            <div></div>
            {{this.x}}
            <IF exp="this.x === 100"> Is one hundred </IF>
            <IF exp="this.x === 200">Is two hundred</IF>
            <IF exp="true">
                <FOR exp="let slotName of Object.keys(this.$$slots)">
                    -{{slotName}}-
                    <content style="border: 1px solid #febebe">
                        <slot set.name="slotName"></slot>
                    </content>
                </FOR>
            </IF>
        </div>

        <style>
            .collapse > div{
                height: v(--this-x)px
            }
            .collapse > div:hover {
                background: #7e7e7e;
            }
        </style>`
}

import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
        setInterval(() => {
            this.x++
            if (this.x >= 60) {
                this.x = 0
            }
        }, 1000)
    }

    x = 0

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

        <style angle="this.x">
            .collapse > div {
                height: 3px;
                transform: translateX(100px) rotateZ(calc(var(--angle) * 6deg  - 90deg)) translateX(40px) ;
                background: #bebebe;
                width: 100px;
            }
            .collapse > div:hover {
                background: #7e7e7e;
            }
        </style>`
}

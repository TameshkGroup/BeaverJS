import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'
import Iconify from '@iconify/iconify';

@AsPuya
export default class CheckInput extends BVRElement {
    value = 1

    mounted(): void {
        setInterval(() => {
            this.value++
        }, 1000);
        console.log('Iconify.listIcons()', Iconify.listIcons())
    }

    $$template = html`
        <label
            style="width: 100%;; user-select: none; cursor: pointer"
            @click="this.props.value = !this.props.value"
        >
        
            <div style="display: flex;">
                {{this.props.value}}
                <div set.class="this.props.value?'checked':''" set.style="';opacity: ' + (this.props.value ? '0' : '1')" class="check-box" style="width: 16px; height: 16px">
                    <i class="iconify" data-icon="ph:check-bold"></i>
                </div>
                <div style="flex: 1">{{ this.props.label }}</div>
            </div>
            
        </label>
        <style>
            .check-box {
                border: 1px solid #555
            }
        </style>
    `
}

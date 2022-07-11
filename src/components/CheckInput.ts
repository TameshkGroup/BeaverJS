import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'
import Iconify from '@iconify/iconify'
Iconify
@AsPuya
export default class CheckInput extends BVRElement {
    value = 1

    mounted(): void {}

    $$template = html`
        <label
            @click="this.props.value = !this.props.value"
        >
            <div tabindex="1" @keypress="$event.preventDefault();this.props.value = !this.props.value">
                <div
                    set.class="this.props.value?'checked':''"
                    class="check-box"
                >
                    <div
                        class="check"
                        set.style="';opacity: ' + (this.props.value ? '1' : '0') + '; transform: scaleX(' + (this.props.value? '1' : '0.1') + ')'"
                    >
                        <i class="iconify" data-icon="ph:check-bold" style="color: #888"></i>
                    </div>
                </div>
                <div class="label" style="flex: 1">
                    {{ this.props.label?this.props.label:'' }}
                    <slot/></slot>
                </div>

            </div>
        </label>
        <style>
            .check-box {
                border: 1px solid #555;
                height: 16px;
                width: 16px;
            }
            .check {
                transition: opacity ease-in 0.15s, transform ease-in 0.15s;
            }
            label{
                width: 100%;
                user-select: none;
                cursor: pointer
            }
            label > div {
                display: flex;
                gap: 3px;
                align-items: center;
                border: solid 1px transparent;
                padding: 3px;
            }
            label > div:focus {
                border: solid 1px #555;
                padding: 3px;
            }
        </style>
    `
}

import { Element } from 'domhandler'
import { AsPuya, BVRElement, html } from '..'

@AsPuya
export default class Radio extends BVRElement {
    mounted() {
        console.log('this', this)
    }

    $$template: Partial<Element> = html`
            {{this.m.variable}}
            <label
                class="bvr-radio"
                tabindex="1"
                @keypress="$event.preventDefault();this.props.value = !this.props.value"
                @click="this.props.value = !this.props.value"
            >

                <div class="radio-hole">
                    <div
                        class="radio-filler"
                        set.style="';opacity: ' + (this.props.value ? '1' : '0') + '; transform: scale(' + (this.props.value? '1' : '0.1') + ')'"
                    >
                    <i class="iconify" data-icon="ph:circle-fill" style="color: #666"></i>
                    </div>
                </div>
                <div>
                    <slot></slot>
                </div>
            </div>
            <style>
                .bvr-radio {
                    display: flex;
                    gap: 6px;
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    padding: 3px;
                }
                label > div:focus {
                    border: solid 1px #555;
                    padding: 3px;
                }
                .radio-hole {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    border: 1px solid #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .radio-filler {
                    transition: opacity ease-in 0.15s, transform ease-in 0.15s;
                    font-size: 14px;
                }
            </style>
        `
}

import BVRElement, { html } from '../BVRElement'
import { AsPuya } from '../Puya'

@AsPuya
export default class CheckInput extends BVRElement {
    value = 1

    mounted(): void {
        setInterval(() => {
            this.value++
        }, 1000)
    }

    $$template = html`
        <label
            style="width: 100%;; user-select: none; cursor: pointer"
            @click="this.props.value = !this.props.value"
        >
        
            <div style="display: flex;">
                <div style="width: 181px; height: 18px">
                    <if exp="this.props.value"> checked3 </if>
                    <if exp="!this.props.value"> unchecked</if>
                </div>
                <div style="flex: 1">{{ this.props.label }}</div>
            </div>
            
        </label>
    `
}

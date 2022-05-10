import { AsPuya, BVRElement, html } from '..'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
    }

    x = 0
    items: { key: string; opened: boolean }[] = []

    mounted(): void {
        this.items = Object.keys(this.$$slots)
            .filter((slotName) => slotName.indexOf('title-') === 0)
            .map((key, index) => ({ key: key.replace('title-', ''), opened: index === 0 }))
    }

    $$template = html`<div class="collapse">
            <FOR exp="let item of this.items">
                -{{item.key}}-
                <div class="collapse-item">
                    <div
                        class="collapse-title"
                        @click="console.log('item.opened', item.opened);item.opened = !item.opened"
                    >
                        <slot set.name="'title-' + item.key"></slot>
                    </div>
                    <div class="collapse-content">
                        <IF exp="item.opened">
                            <slot set.name="'content-' + item.key"></slot>
                        </IF>
                    </div>
                </div>
            </FOR>
            <IF exp="!!this.activedItemKey"> </IF>
        </div>

        <style angle="this.x">
            .collapse-item {
                background: #7e7e7e;
            }
            .collapse-title {
                cursor: pointer;
                user-select: none;
            }
        </style>`
}

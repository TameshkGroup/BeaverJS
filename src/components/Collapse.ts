import { AsPuya, BVRElement, html } from '..'

@AsPuya
export default class Collapse extends BVRElement {
    constructor() {
        super()
    }

    items: { key: string; opened: boolean; bounding?: DOMRect }[] = []

    bounding!: DOMRect

    state: {
        bounding?: DOMRect
    } = {
        bounding: undefined,
    }

    mounted(): void {
        this.addSubscribe('bounding', (bounding) => {
            console.log('bounding', bounding)
        })
        this.items = Object.keys(this.$$slots)
            .filter((slotName) => slotName.indexOf('title-') === 0)
            .map((key, index) => ({
                key: key.replace('title-', ''),
                opened: index === 0,
                bounding: {} as DOMRect,
            }))
    }

    $$template = html`<div class="collapse">
            <FOR exp="let i in this.items" key="key">
                <div class="collapse-item">
                    <div
                        class="collapse-header"
                        @click="console.log('item.opened',this.items[i].opened);this.items[i].opened = !this.items[i].opened"
                    >
                        <slot set.name="'title-' + this.items[i].key"></slot>
                    </div>
                    <div
                        class="collapse-content"
                        set.style.height="this.items[i].opened ? this.items[i].bounding.height + 'px' : '0px'"
                    >
                        <div
                            class="collapse-container"
                            get.boundingRect="this.items[i].bounding.height"
                        >
                            <div>
                                <slot set.name="'content-' + this.items[i].key"></slot>
                            </div>
                        </div>
                    </div>
                </div>
            </FOR>
        </div>

        <style angle="this.x">
            .collapse-item {
                border-radius: 16px;
                border: 1px solid #bebebe;
                margin: 10px 0;
            }
            .collapse-header {
                cursor: pointer;
                user-select: none;
                padding: 16px;
                border-radius: 16px;
            }
            .collapse-header:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            .collapse-content {
                overflow: hidden;
                transition: height ease-in 0.1s;
            }
            .collapse-container {
                overflow: visible;
                box-sizing: border-box;
            }
            .collapse-container > div {
                padding: 16px;
            }
        </style>`
}

import BVRElement, { html } from './BVRElement'
import _ from 'lodash'
import { AsPuya } from './Puya'
import TextInput from './components/TextInput'
import CheckInput from './components/CheckInput'
import Collapse from './components/Collapse'

@AsPuya
export default class App extends BVRElement {
    $$elements: Record<string, Constructor<BVRElement>> = { TextInput, CheckInput, Collapse }

    value = 'value2'

    arr: number[] = _.range(1, 2)
    x: any
    y: number = 100
    beforeMount(): void {
        this.x = { x: 10 }
    }

    async mounted() {
        this.x.x = 13
        setInterval(() => {
            this.x.x = this.x.x + 1
        }, 1000)
    }

    checked = true

    _ = _

    $$template = html` <div>
        <span style="font-weight: bold">{{ this.x.x }}</span>
        {{this.value}}
        <br />
        <TextInput bi.value="this.value" />
            <filler slot="append">
                @
            </filler>
        </TextInput>
        <br />
        <TextInput bi.value="this.value" />
            <filler slot="prepend">
                #
            </filler>
        </TextInput>
        <br />

        <Collapse>
            <filler slot="content-1">
                Content-1
            </filler>
            <filler slot="content-2">
                Content-2
            </filler>
        </Collapse>
    </div>`
}

/* if (import.meta.hot) {
    import.meta.hot.accept((accept) => {
        console.log('aai', { accept })
    })
    import.meta.hot.accept('./TextInput', (accept) => {
        console.log('a1', { accept })
    })
    import.meta.hot.on('vite:beforeUpdate', (payload) => {
        console.log('vite:beforeUpdate', payload)
    })
    import.meta.hot.accept((newModule) => {
        console.log('updated: count is now ')
        console.log('n', newModule)
    })
    import.meta.hot.on('special-update', (su) => {
        console.log('specialUpdate', su)
    })
} */

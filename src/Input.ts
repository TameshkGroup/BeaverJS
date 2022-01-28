import { HTML, PHE } from './PHE'
import { AsPuya } from './Puya'

@AsPuya
export default class Input extends PHE {
    constructor() {
        super()
        console.log('-- this constructor invoked --')
    }

    name = 'ok1'
    counter = 1

    value: object | null = null;
    a = ''
    val = '12'
    v = '12'

    beforeMount(): void {
    
        this.value = {}
    }

    mounted() {
        this.name = 'ok'
        this.counter = 0
    }

    $$template = HTML`
    <div>{{this.counter}}
        <input @input="this.value.v = $event.target.value; console.log(this)"/>
        {{this.value.v}}
    </div>
    <button @click="console.log(this)">OK</button>
    `
}

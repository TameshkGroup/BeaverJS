import { HTML, PHE } from './PHE'
import { AsPuya } from './Puya'

@AsPuya
export default class Input extends PHE {

    value = {v: 10}


    $$template = HTML`
    <div>
        <input @input="this.value.v = $event.target.value"/>
        {{this.value.v}}
    </div>
    `
}

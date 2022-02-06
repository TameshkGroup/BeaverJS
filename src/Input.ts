import { HTML, PHE } from './PHE'
import { AsPuya } from './Puya'

@AsPuya
export default class Input extends PHE {
    value = {v: 10}
    $$template = HTML`
    <div>
        x:
        <input @input="this.props.x = $event.target.value"/>
        y:
        <input @input="this.props.y = $event.target.value"/>
        {{this.props.x}} {{this.props.y}}
    </div>
    `
}

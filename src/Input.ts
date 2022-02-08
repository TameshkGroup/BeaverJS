import { HTML, PHE } from './PHE'
import { AsPuya } from './Puya'

@AsPuya
export default class Input extends PHE {
    $$template = HTML`
    <div>
        {{this.props.value}}
        <input @input="this.props.value = $event.target.value" value{='this.props.value' input}='this.props.value' />
    </div>
    `
}

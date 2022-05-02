import { Element } from 'domhandler/lib'
import css, { parse } from 'css'
import BVRElement, { appendElFromTemplate } from '..'
/* import * as ts from 'typescript'
 */
export default class StyleDirective {
    constructor(private bvrElement: BVRElement) {}

    render(templateEl: Element, scope: any, parentScopeId: string): (HTMLElement | Comment)[] {
        console.log((templateEl.children[0] as unknown as Text).data)
        const parsed = css.parse((templateEl.children[0] as unknown as Text).data)
        if(!parsed.stylesheet)
            return[];
        parsed.stylesheet.rules = parsed.stylesheet.rules.map((rule)=>{
            console.log('rule', rule)
            rule.selectors = rule.selectors.map((selector)=>{
                selector =  `[instance_id=${this.bvrElement.$id}] ${selector}`
                return selector;
            })
            return rule
        })
        css.stringify(parsed);
        console.log(parsed, this.bvrElement)
        
        const styleElement = document.createElement('style');
        styleElement.innerHTML = (templateEl.children[0] as unknown as Text).data

        return [styleElement]
    }
}

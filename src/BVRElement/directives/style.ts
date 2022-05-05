import { Element } from 'domhandler/lib'
import css from 'css'
import BVRElement from '..'
/* import * as ts from 'typescript'
 */
export default class StyleDirective {
    constructor(private bvrElement: BVRElement) { }

    render(templateEl: Element, scope: any, parentScopeId: string): (HTMLElement | Comment)[] {
        console.log((templateEl.children[0] as unknown as Text).data)
        const parsed = css.parse((templateEl.children[0] as unknown as Text).data)
        if (!parsed.stylesheet)
            return [];
        parsed.stylesheet.rules = parsed.stylesheet.rules.map(($rule) => {
            const rule = $rule as { selectors: string[] };
            rule.selectors = rule.selectors.map((selector) => {
                selector = selector.split(/\s+/g).reduce((acm, part) => {
                    if (part === '>')
                        return acm + ' > ';
                    else {
                        const splitted = part.split(':');
                        return acm + (splitted[0] + `[instance_id=${this.bvrElement.$id}]`) + (splitted[1] ? ':' + splitted[1] : '')
                        //return acm + part + `[instance_id=${this.bvrElement.$id}]`;
                    }
                }, '')
                return selector
            })
            return rule
        })
        const styleElement = document.createElement('style');

        const cssString = css.stringify(parsed);

        const set = () => {
            cssString.replace(/ /g, () => {

        });
        }
        set();

        styleElement.innerHTML = cssString;

        return [styleElement]
    }
}

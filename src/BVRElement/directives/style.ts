import { Element } from 'domhandler/lib'
import { nanoid } from 'nanoid'
import BVRElement, { appendElFromTemplate } from '..'
/* import * as ts from 'typescript'
 */
export default class StyleDirective {
    constructor(private bvrElement: BVRElement) {}

    render(templateEl: Element, scope: any, parentScopeId: string): (HTMLElement | Comment)[] {
        return []
    }
}

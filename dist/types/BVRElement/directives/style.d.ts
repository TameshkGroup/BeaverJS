import { Element } from 'domhandler/lib';
import BVRElement from '..';
export default class StyleDirective {
    private bvrElement;
    constructor(bvrElement: BVRElement);
    render(templateEl: Element, _scope: any, parentScopeId: string): (HTMLElement | Comment)[];
}
//# sourceMappingURL=style.d.ts.map
import { Element } from 'domhandler/lib';
import BVRElement from '..';
export default class IfDirective {
    private bvrElement;
    constructor(bvrElement: BVRElement);
    static tagName: string;
    render(templateEl: Element, parentScopeId: string): HTMLElement;
}
//# sourceMappingURL=if.d.ts.map
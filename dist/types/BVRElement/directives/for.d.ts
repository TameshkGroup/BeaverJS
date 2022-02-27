import { Element } from 'domhandler/lib';
import BVRElement from '..';
export default class ForDirective {
    private bvrElement;
    constructor(bvrElement: BVRElement);
    static tagName: string;
    render(templateEl: Element, parentScopeId: string): HTMLElement;
}
//# sourceMappingURL=for.d.ts.map
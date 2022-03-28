import { Element } from 'domhandler/lib';
import BVRElement from '..';
export default class ForDirective {
    private bvrElement;
    constructor(bvrElement: BVRElement);
    static tagName: string;
    render(templateEl: Element, scope: any, parentScopeId: string): (HTMLElement | Comment)[];
}
//# sourceMappingURL=for.d.ts.map
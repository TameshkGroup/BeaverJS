import { Element } from 'domhandler/lib';
import BVRElement from '..';
export default class ComponentDirective {
    private bvrElement;
    constructor(bvrElement: BVRElement);
    static tagName: string;
    render(templateEl: Element, __: any, parentScopeId: string): HTMLDivElement;
}
//# sourceMappingURL=component.d.ts.map
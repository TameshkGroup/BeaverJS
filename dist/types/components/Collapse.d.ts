import { BVRElement } from '..';
export default class Collapse extends BVRElement {
    constructor();
    items: {
        key: string;
        opened: boolean;
        bounding?: DOMRect;
    }[];
    bounding: DOMRect;
    state: {
        bounding?: DOMRect;
    };
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=Collapse.d.ts.map
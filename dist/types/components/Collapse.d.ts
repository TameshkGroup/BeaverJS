import { BVRElement } from '..';
export default class Collapse extends BVRElement {
    constructor();
    x: number;
    items: {
        key: string;
        opened: boolean;
    }[];
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=Collapse.d.ts.map
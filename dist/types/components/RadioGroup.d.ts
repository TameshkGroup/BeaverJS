import BVRElement from '../BVRElement';
import { Puya } from '../Puya';
declare class M extends Puya {
    variable?: string;
}
export default class RadioGroup extends BVRElement {
    value: any;
    m: M;
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
export {};
//# sourceMappingURL=RadioGroup.d.ts.map
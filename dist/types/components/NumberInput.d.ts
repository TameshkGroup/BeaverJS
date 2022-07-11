import BVRElement from '../BVRElement';
import CheckInput from './CheckInput';
export default class NumberInput extends BVRElement {
    $$elements: {
        CheckInput: typeof CheckInput;
    };
    value: number;
    click?: () => void;
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=NumberInput.d.ts.map
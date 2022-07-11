import BVRElement from '../BVRElement';
import CheckInput from './CheckInput';
export default class TextInput extends BVRElement {
    $$elements: {
        CheckInput: typeof CheckInput;
    };
    value: number;
    click?: () => void;
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=TextInput.d.ts.map
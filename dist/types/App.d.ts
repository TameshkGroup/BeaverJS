import { BVRElement } from '.';
import Collapse from './components/Collapse';
import CheckInput from './components/CheckInput';
import RadioGroup from './components/RadioGroup';
import Radio from './components/Radio';
export default class App extends BVRElement {
    $$elements: {
        Collapse: typeof Collapse;
        CheckInput: typeof CheckInput;
        RadioGroup: typeof RadioGroup;
        Radio: typeof Radio;
    };
    arr: never[];
    inputValue?: number | undefined;
    check: boolean;
    radio: boolean;
    mounted(): Promise<void>;
    inputChanged(value: string): void;
    template(): Partial<import("domhandler").Element>;
}
//# sourceMappingURL=App.d.ts.map
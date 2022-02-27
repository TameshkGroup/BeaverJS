import BVRElement from './BVRElement';
import TextInput from './TextInput';
export default class App extends BVRElement {
    $$elements: {
        TextInput: typeof TextInput;
    };
    constructor();
    value: string;
    arr: number[];
    x: any;
    y: number;
    beforeMount(): void;
    mounted(): Promise<void>;
    checked: boolean;
    template(): Partial<import("domhandler").Element>;
}
//# sourceMappingURL=App.d.ts.map
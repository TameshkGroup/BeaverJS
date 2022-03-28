import BVRElement from './BVRElement';
import _ from 'lodash';
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
    _: _.LoDashStatic;
    template(): Partial<import("domhandler").Element>;
}
//# sourceMappingURL=App.d.ts.map
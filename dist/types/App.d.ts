import BVRElement from './BVRElement';
import _ from 'lodash';
export default class App extends BVRElement {
    $$elements: Record<string, Constructor<BVRElement>>;
    value: string;
    arr: number[];
    x: any;
    y: number;
    beforeMount(): void;
    mounted(): Promise<void>;
    checked: boolean;
    _: _.LoDashStatic;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=App.d.ts.map
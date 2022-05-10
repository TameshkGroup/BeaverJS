import { BVRElement } from '.';
import Collapse from './components/Collapse';
export default class App extends BVRElement {
    $$elements: {
        Collapse: typeof Collapse;
    };
    test: string;
    arr: number[];
    inputValue?: number | undefined;
    check: boolean;
    mounted(): Promise<void>;
    inputChanged(value: string): void;
    template(): Partial<import("domhandler").Element>;
}
//# sourceMappingURL=App.d.ts.map
import BVRElement from './BVRElement';
export default class TextInput extends BVRElement {
    value: string;
    click?: () => void;
    mounted(): void;
    $$template: Partial<import("domhandler").Element>;
}
//# sourceMappingURL=TextInput.d.ts.map
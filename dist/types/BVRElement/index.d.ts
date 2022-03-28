import { Puya } from '../Puya';
import { DataNode, Document, Element } from 'domhandler/lib';
export declare enum ElementType {
    /** Type for the root element of a document */
    Root = "root",
    /** Type for Text */
    Text = "text",
    /** Type for <? ... ?> */
    Directive = "directive",
    /** Type for <!-- ... --> */
    Comment = "comment",
    /** Type for <script> tags */
    Script = "script",
    /** Type for <style> tags */
    Style = "style",
    /** Type for Any tag */
    Tag = "tag",
    /** Type for <![CDATA[ ... ]]> */
    CDATA = "cdata",
    /** Type for <!doctype ...> */
    Doctype = "doctype"
}
export declare type Item = BVRElement | null | undefined | string | number;
export declare function html(template: TemplateStringsArray, ...a: any[]): Partial<Element>;
export declare const appendElFromTemplate: (that: BVRElement, templateEl: Partial<Element | DataNode | Document> | Partial<Element | DataNode | Document>[], htmlParentEl?: HTMLElement | undefined, scope?: Record<string, any>, scopeId?: string | undefined) => string | HTMLElement | Text | undefined | (HTMLElement | Comment)[];
declare type Slot = {
    filler?: Partial<Element | DataNode | Document>;
    templatePath: number[];
};
export default class BVRElement extends Puya {
    static $$includedElems: Record<string, typeof BVRElement>;
    $$rootElement: HTMLElement;
    $$parent?: BVRElement;
    $$elementSelector?: string;
    $$slots: Record<string, Slot>;
    props: Record<string, any>;
    $$directives: never[];
    $$elements: Record<string, Constructor<BVRElement>>;
    template(): Partial<Element> | void;
    mounted(): void;
    mount(): Promise<void>;
    $$template: Partial<Element>;
    render(): void;
}
export {};
//# sourceMappingURL=index.d.ts.map
export declare type Value = any;
export declare type SubscriptionValue = {
    fn: (value: Value) => void;
    class?: string;
    id: string;
};
export declare function AsPuya<T extends new (...arg: any[]) => any>(target: T extends typeof Puya ? typeof Puya : typeof Puya): any;
export declare class Puya {
    $$subscribes: Record<string, SubscriptionValue[]>;
    addSubscribe(path: string, fn: (value: Value) => void, klass?: string, throttle?: number): string;
    addSubscribe(fn: (value: Value) => void, klass?: string, throttle?: number): string;
    removeSubscribeByClass(klass: string): void;
    render(): void;
    $$ctx: Record<string | symbol, any>;
    $id: string;
    constructor();
    $$beforeMountListeners: Record<string, () => void>;
    addBeforeMountListener(listener: () => void): string;
    beforeMount(): void;
}
//# sourceMappingURL=index.d.ts.map
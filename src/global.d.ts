declare module '*.pts' {
    type BVRElement = typeof import('./BVRElement')
    export default BVRElement
}

type Constructor<T> = {
    new (...args: any[]): T
}
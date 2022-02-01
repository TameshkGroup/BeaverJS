declare module '*.pts' {
    type PHE = import('./PHE').PHE
    export default PHE
}

type Constructor<T> = {
    new (...args: any[]): T
}
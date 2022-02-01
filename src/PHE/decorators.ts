import { PHE } from ".";



export function Element(accessibleIn: typeof PHE) {
    
    //const obj = new constructor();
    //console.log("-- created from Element decorator --", obj);
    //constructor.prototype.selfDrivable = true;
    return function (constructor: typeof PHE) {
        //@ts-ignore
        accessibleIn.$$includedElems[constructor.name] = constructor;
    }
}

import { PHE } from ".";



export function Element(accessibleIn: typeof PHE) {
    
    //const obj = new constructor();
    //console.log("-- created from Element decorator --", obj);
    //constructor.prototype.selfDrivable = true;
    return function (constructor: typeof PHE) {
        console.log("-- decorator function invoked --", constructor.name);
        //@ts-ignore
        accessibleIn.$$includedElems[constructor.name] = constructor;
    }
}

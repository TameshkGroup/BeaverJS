import { isArray, isObject } from "../shared";

// export function createStore(trigger: () => void) {
//   return function store(obj: any, path: string[] = []) {
//     Object.entries(obj).map(([k, p]) => {
//       if (isObject(p) || isArray(p)) {
//         return store(obj[k], [k, ...path]);
//       }
//     });

//     return new Proxy(obj, {
//       set: (target, p, value) => {
//           console.log('p', value)
//         if (isObject(value)) {
//           console.log("isObj");
//           target[p] = store(value, [p as string, ...path]);
//         } else {
//           target[p] = value;
//         }
//         trigger();
//         console.log("obj[p] = value", path, obj);
//         return true;
//       },
//     });
//   };
// }

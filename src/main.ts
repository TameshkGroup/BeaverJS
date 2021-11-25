import Input from "./Input";
import { App } from "./App";

global;
const __DEV__ = false;

const main = new App("#app");
main.mount();


console.log('-- App --', App.$$includedElems);

console.log("-- creating an instance --");
const input = new Input();

console.log("-- input now --", input);



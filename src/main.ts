import App from "./App";

const __DEV__ = false;

const main = new App("#app");
main.mount();

console.log('-- App --', App.$$includedElems);

console.log("-- creating an instance --");


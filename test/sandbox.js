const MockPromise = require("../mockPromiseFunction");

console.log("start");
setTimeout(() => console.log("timeout"), 0);
MockPromise.resolve(0).then(() => console.log("promise"));
console.log("end");

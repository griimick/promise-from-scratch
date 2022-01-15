const MockPromise = require("../mockPromiseFunction");

let x = new MockPromise((resolve, reject) => {
	setTimeout(() => reject(new Error("dummy")), 2000);
});
let y = new Promise((resolve, reject) => {
	setTimeout(() => reject(new Error("dummy")), 2000);
});

x.then(() => console.log("then")).finally(() => console.log("finally")).catch((error) => console.error(error));
y.then(() => console.log("then")).finally(() => console.log("finally")).catch((error) => console.error(error));

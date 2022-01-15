const MockPromise = require("../mockPromiseFunction");

// In order to test your promise library, a very minimal adapter interface
// is to be exposed to promises-test
const adapter = {
	deferred() {
		let reject, resolve;
		const promise = new MockPromise((res, rej) => {
			reject = rej;
			resolve = res;
		});
		return {
			promise,
			resolve,
			reject,
		};
	},
	resolved: (val) => new MockPromise((res) => res(val)),
	rejected: (val) => new MockPromise((_, rej) => rej(val)),
};

module.exports = adapter;

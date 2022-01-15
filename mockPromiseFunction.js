const STATUS = {
	pending: 0,
	fulfilled: 1,
	rejected: 2,
};
Object.freeze = STATUS;

const getThen = value => {
	if (value && typeof value.then === "function") {
		return value.then;
	}
};

const isFunction = (fn) => typeof fn === "function";

function MockPromsie(fn) {
	let status = STATUS.pending;
	let value;
	let handlers = [];

	const fulfill = (result) => {
		status = STATUS.fulfilled;
		value = result;
		handlers.forEach(h => h.onFulfill(value));
	};

	const reject = (error) => {
		status = STATUS.rejected;
		value = error;
		handlers.forEach(h => h.onReject(value));
	};

	const process = (fn) => {
		fn(
			result => {
				const then = getThen(result);
				if (then) {
					process(then);
					return;
				}
				fulfill(result);
			},
			error => reject(error)
		);
	};

	const handle = (onFulfill, onReject) => {
		if(status === STATUS.pending) handlers.push({ onFulfill, onReject });
		if(status === STATUS.fulfilled) onFulfill(value);
		if(status === STATUS.rejected) onReject(value);
	};

	this.then = (onFulfill, onReject) => {
		return new MockPromsie((resolve/*, reject */) => {
			handle(
				result => {
					if(isFunction(onFulfill)) {
						resolve(onFulfill(result));
						return;
					}
					resolve(result);
				},
				error => {
					if(isFunction(onReject)) {
						resolve(onReject(error));
						return;
					}
					reject(error);
				}
			);
		});
	};
	process(fn);
}

MockPromsie.resolved = (value) => new MockPromsie((res) => res(value));
MockPromsie.rejected = (value) => new MockPromsie((_, rej) => rej(value));

module.exports = MockPromsie;

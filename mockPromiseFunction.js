const STATUS = {
	pending   : 0,
	fulfilled : 1,
	rejected  : 2,
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

	// pending -> fulfilled: state transition fn
	const fulfill = (result) => {
		status = STATUS.fulfilled;
		value = result;
		// call onFulfilled for all attached handlers
		handlers.forEach(h => h.onFulfill(value));
	};

	// pending -> rejected: state transition fn
	const reject = (error) => {
		status = STATUS.rejected;
		value = error;
		// call onRejected for all attached handlers
		handlers.forEach(h => h.onReject(value));
	};

	// Call the param fn as soon as MockPromise constructor is called
	const process = (fn) => {
		fn(
			result => {
				// if result is a MockPromise itself
				// we are checking if result has .then function
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

	function handle(onFulfill, onReject) {
		if(status === STATUS.pending) handlers.push({ onFulfill, onReject });
		if(status === STATUS.fulfilled) onFulfill(value);
		if(status === STATUS.rejected) onReject(value);
	}

	// onFulfill and onReject are optional parameters in `then` 
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

// Promise.resolve(2)
MockPromsie.resolved = (value) => new MockPromsie((res) => res(value));
// Promise.reject(new Error('dummy'))
MockPromsie.rejected = (value) => new MockPromsie((_, rej) => rej(value));

module.exports = MockPromsie;

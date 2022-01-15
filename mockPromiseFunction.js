const STATUS = {
	pending   : 0,
	fulfilled : 1,
	rejected  : 2,
};
Object.freeze = STATUS;

const getThen = value => {
	const type = typeof value;
	if(value && type === "object"|| type == "function") {
		const then = value.then;
		if (typeof then === "function") {
			return then;
		}
	}
};

const isFunction = (fn) => typeof fn === "function";

function MockPromise(fn) {
	let status = STATUS.pending;
	let value;
	let handlers = [];

	// pending -> fulfilled: state transition fn
	const fulfill = (result) => {
		status = STATUS.fulfilled;
		value = result;

		// call onFulfill on next tick
		setTimeout(() => {
			// call onFulfilled for all attached handlers
			handlers.forEach(h => h.onFulfill(value));
		}, 0);
	};

	// pending -> rejected: state transition fn
	const reject = (error) => {
		status = STATUS.rejected;
		value = error;

		// call onReject on next tick
		setTimeout(() => {
			// call onRejected for all attached handlers
			handlers.forEach(h => h.onReject(value));
		}, 0);
	};

	// Call the param fn as soon as MockPromise constructor is called
	const process = (fn) => {
		// promise can be resolved/rejected once 
		// so need to maintain if process has been called or not
		let called = false;
		try {
			fn(
				result => {
					// promise cannot resolve using itself as the value
					if (result === this)
						throw new TypeError();

					if(called) return;
					called = true;

					try {
					// if result is a MockPromise itself
						// we are checking if result has .then function
						const then = getThen(result);
						if (then) {
							process(then.bind(result));
							return;
						}
					}
					catch(err) {
						reject(err);
						return;
					}

					fulfill(result);
				},
				error => {
					// promise cannot reject using itself as the error
					if (error === this)
						throw new TypeError();

					if(called) return;
					called = true;
					reject(error);
				}
			);
		}
		catch(err){
			if(called) return;
			called = true;
			reject(err);
		}
	};

	function handle(onFulfill, onReject) {
		setTimeout(() => {
			if(status === STATUS.pending) handlers.push({ onFulfill, onReject });
			if(status === STATUS.fulfilled) onFulfill(value);
			if(status === STATUS.rejected) onReject(value);
		}, 0);
	}

	// onFulfill and onReject are optional parameters in `then` 
	this.then = (onFulfill, onReject) => {
		return new MockPromise((resolve, reject) => {
			handle(
				result => {
					if(isFunction(onFulfill)) {
						try{
							resolve(onFulfill(result));
						}
						catch(error){
							reject(error);
						}
						return;
					}
					resolve(result);
				},
				error => {
					if(isFunction(onReject)) {
						try {
							resolve(onReject(error));
						}
						catch(error){
							reject(error);
						}
						return;
					}
					reject(error);
				}
			);
		});
	};

	this.catch = (onReject) => {
		return this.then(void 0, onReject);
	};

	this.finally = (onFinally) => {
		if(isFunction(onFinally)) {
			return this.then(
				(result) => MockPromise.resolve(onFinally()).then(() => { return result; }),
				(error) => MockPromise.resolve(onFinally()).then(() => { throw error; }),
			);
		}
		return this.then(onFinally, onFinally);
	};
	process(fn);
}

// Promise.resolve(2)
MockPromise.resolve = (value) => new MockPromise((res) => res(value));
// Promise.reject(new Error('dummy'))
MockPromise.reject = (value) => new MockPromise((_, rej) => rej(value));

module.exports = MockPromise;

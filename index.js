class MockPromise {
	constructor(fn) {
		this.status = STATUS.pending;
		this.handlers = []; //[{ onFulfilled: <first arg of then>, onRejected: <second arg of then> }]
		this.process(fn);
	}

	fulfill(result) {
		this.status = STATUS.fulfilled;
		this.value = result;
		this.handlers.forEach(h => h.onFulfilled(this.value));
	}

	reject(err) {
		this.status = STATUS.rejected;
		this.value = err;
		this.handlers.forEach(h => h.onRejected(this.value));
	}

	process(fn) {
		fn(
			result => {
				const then = getThen(result);
				if (then) {
					this.process(then);
					return;
				}
				this.fulfill(result);
			},
			error => this.reject(error),
		)
	}

	handle(onFulfilled, onRejected) {
		if (this.status === STATUS.pending) {
			this.handlers.push({
				onFulfilled,
				onRejected,
			});
		}
		if(this.status === STATUS.fulfilled) {
			onFulfilled(this.value);
		}
		if(this.status === STATUS.rejected) {
			onRejected(this.value);
		}
	}

	then(onFulfilled, onRejected) {
		return new MockPromise((resolve, reject) => {
			this.handle(
				(result) => onFulfilled,
				(error) => onRejected
			);
		});
	}
}
const STATUS = {
	pending: 1,
	fulfilled: 2,
	rejected: 3,
}
Object.freeze(STATUS);
MockPromise.STATUS = STATUS;

function getThen(value) {
	if (value && typeof value === 'function') {
		return value.then;
	}
}

module.exports = MockPromise;

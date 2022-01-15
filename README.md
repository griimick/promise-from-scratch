# promise-from-scratch
Promise from scratch for educational purpose

- Support the following:
```js
// new Promise object
new MockPromise((resolve, reject) => {});

// Immediately resolved Promise
MockPromise.resolve(value);

// Immendiately rejected Promise
MockPromise.reject(new Error('some error'));

// .then() handler support
MockPromise.resolve(2).then(() => console.log('resolved'));

// .catch() handler support
MockPromise.reject(new Error('dummy error')).then(() => console.log('resolved')).catch(err => console.error(err))

// .finally handler support
MockPromise.resolve(2).then(() => console.log('resolved')).catch(err => console.error(err)).finally(() => console.log('finally'))
```
- Uses Node.js `process.nextTick()` to use microtask qeueue similar to Native Promise.

### Tests

Covers all the test cases from promises-aplus draft test suite
```
npm run test
```
### TODO
- [ ] `MockPromise.all()`
- [ ] `MockPromise.any()`
- [ ] `MockPromise.allSetlled()`
- [ ] `MockPromise.race()`

### References
![image](https://user-images.githubusercontent.com/10350864/149624380-d5e1b22d-adb8-4fb9-b7dd-fe6c9f49ca8b.png)
- Spec: https://promisesaplus.com/
- Test Cases: https://github.com/promises-aplus/promises-tests#readme

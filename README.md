# Dynamic JSON Data
**djd.js** is an easy-to-use JavaScript library for using dynamic JSON data in your web pages.

---

## Importing
Copy the `djd.js` file into your project folder and import it into your HTML page like this:
```html
<script type="module">
    import data from './djd.js';
    // Your code here...
</script>
```
**Important**: This library uses ES6 modules.
- for development, you must run your web page on a server (e.g. with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code)

- if you care about Internet Explorer support, you will need to use a module bundler like [Rollup](https://rollupjs.org/guide/en/) or [Webpack](https://webpack.js.org/)

---

## Usage
### `<dynamic-data>` HTML element
With this library comes a custom `<dynamic-data>` HTML element, which you can use to dynamically display data from the `data` object. To set the data to display, use the `data-get` attribute. The value of this attribute should be a path to the data you want to display. This path works like a regular JavaScript object path. Feel free to use nested objects and arrays.

Examples:
```html
<dynamic-data data-get="counter"></dynamic-data>
```
```html
<dynamic-data data-get="user.name"></dynamic-data>
```
```html
<dynamic-data data-get="user.friends[0].name"></dynamic-data>
```

### `data` object
When you import the library, you get a `data` object. This object has `get` and `set` paths (methods) for getting and setting data, respectively. When set like this, the data is automatically displayed in the `dynamic-data` elements.
```js
data.set.counter = 0;
data.set.counter++;
console.log(data.get.counter); // 1
```

**Take a look at the [simple counter](https://github.com/dino-prpic/djd.js/blob/master/tests/counter-simple.html) and [simple nested data](https://github.com/dino-prpic/djd.js/blob/master/tests/structured-simple.html) example to see it in action.**

---

If your needs are more complex than purely displaying a value, you can ditch the `<dynamic-data>` element and use `data.changed(path, callback)` method instead. This method takes two arguments:
- [path](#paths-logic) to the data you want to display 
- callback function - called every time the data changes. The callback function will receive the new value of the data as its first argument.
```js
data.changed('counter', (value) => {
    console.log(value);
});
```

---

## Paths logic
By default, the callback function will also be called when the parent object is changed. For example, if you have a nested object like this:
```js
data.set.user = {
    name: 'John Doe',
    age: 23,
    address: {
        street: 'Whatever Street',
        number: 21
    }
};
```
...and have set up a listener like this:
```js
data.changed('user.adress.street', (value) => {
    console.log(value);
});
```
...then the callback function will also be called every time the `user` or `user.address` objects are changed. 

---

On the other hand, **changing child objects will not trigger the callback function** by default. For example, if you have a nested object data like in the previous example, but have set up a listener like this:
```js
data.changed('user', (value) => {
    console.log(value);
});
```
... and changed the `user.address` object, the callback function will not be called.

To fix this, you can use `*` symbol at the end of the path. This will also take into account children objects.
```js
data.changed('user*', (value) => {
    console.log(value);
});
```

**See [nested data advanced example](https://github.com/dino-prpic/djd.js/blob/master/tests/structured-advanced.html)** 

---

## Using local storage
Instead of initializing the `data` object with, for example, `data.set.counter = 0;`, you can use the `data.browser(pathRoot, defaultValue)` method to use data in combination with the local storage. 
```js
data.browser('counter', 0); // saved in local storage
```

This method takes two arguments:
- `pathRoot`: path to the data category you want to save in local storage. You can only set top level path. For example, `counter` or `user`. This will create an eqaully named item in browser's local storage. Nested objects can be used inside, but not fragmentally saved in local storage. In other words, `'user.name'` will NOT work at initialization - use `'user'` here and `{name: 'John'}` in the `defaultValue`.
- `defaultValue` - used if the data is not found in the local storage. If not set, the default value will be an empty object (`{}`).

After initialization, continue using the `data` object as usual (data.set... and data.get...). The data will be automatically saved to the local storage every time it changes. It will also update data when changes are made in other browser tabs.

**Explore the [local counter](https://github.com/dino-prpic/djd.js/blob/master/tests/counter-local.html) and [local nested data](https://github.com/dino-prpic/djd.js/blob/master/tests/structured-local.html) examples for a better understanding.**
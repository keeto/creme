Creme
=====

Creme is a simple API for creating and managing DOM elements, built on top of Google's Incremental DOM.

## Installation

```sh
$ npm install --save creme
```

## Example

```js
var creme = require('creme');

var Greeting = creme.div({
  $static: {id: 'greeting'},
  'data-lang': 'en'
}, [
  creme.h1('Welcome!'),
  creme.p(
    creme.interpolate('Hello {name}!')
  )
])

Greeting.patchInto(document.body, {name: 'World'});

/*
Produces:

<div id="greeting" data-lang="en">
  <h1>Welcome!</h1>
  <p>Hello World!</p>
</div>
*/
```

## Elements

Creme's main abstraction is the `Element`, which is an object that contains properties and children. For example, you can create a `div` `Element` like so:

```js
var creme = require('creme');

var myDiv = creme.div('Hello World');
```

The `creme.div` function in the example above is an *element factory*, and Creme exposes factories for all the commons HTML elements.  Once you have an element, you can "patch" an existing element's contents using the `patchInto` method:

```js
var creme = require('creme');

var myDiv = creme.div('Hello World');

// Replace document.body's contents with <div>Hello World</div>
myDiv.patchInto(document.body);
```

## Creating Custom Element Factories

You can create a factory an element using the `createElement` function. The following example creates the same `creme.div` function above:

```js
// createElement(tagName, isVoid) -> function(attribs, children)

var createElement = require('creme/lib/create_element');
var div = creme.createElement('div', false);

var element = div('Hello World');
```

## Attributes and Children

All element factories take in two optional arguments:

```
elementFactory(attributes, children) -> Element
```

- `attributes` is key-value map describing the attributes and properties of the element.
- `children` could either be a string (representing a text node), an `Element` created from a factory, or an array containing a mixture of both strings and `Element` instances.

### Special Attributes

When passing an object for the `attributes` argument, most of the fields are passed directly to the underlying Incremental DOM implementation. Creme, however, allows you to specify three special properties that affect how your element gets patched into a container.

The first one is `$key`, which is used as a unique identifier for the element. Incremental DOM uses this value during its diff-ing process.

The second one is `$static`, which is a key-value map of the static properties of an element. The value of these properties never change in-between renderings. Setting this attribute requires you to pass a `$key` as well.

```js
var myInput = creme.input({
  $key: 'myInput',
  $static: {
    type: 'text'
  },
  disabled: true
});
```

The third special attribute is `$computed`, which is a key-value map of properties that will be computed during rendering time.

```js
var myInput = creme.input({
  $computed: {
    value: function(data) {
      return data.confirmed ? 'Yes' : 'No';
    }
  }
});

// Renders <input value="Yes">
myInput.patchInto(document.body, {confirmed: true});

// Renders <input value="No">
myInput.patchInto(document.body, {confirmed: false});
```


## Working with Data

Aside from `$computed` attributes, you can also have computed children for your elements.

Aside from strings, `Element` instances and arrays, the `children` parameter element factories can also take in functions. These functions are similar to the functions for `$computed` properties, and are called during rendering time with the data that was passed with `patchInto`.

```js
var greeting = creme.div(
  creme.p(function(data) {
    return 'Hello ' + data.name + '!';
  })
);

// Renders <div><p>Hello World!</p></div>
greeting.patchInto(document.body, {name: 'World'});
```

Functions allow for thing like conditional statements:

```js
var greeting = creme.div([
  creme.h1('Welcome!'),
  function(data) {
    if (data.name) {
      return creme.p('Hello ' + data.name + '!');
    }
    return creme.p('Hello visitor! Welcome to the site!');
  }
]);

greeting.patchInto(document.body, {name: null});
```

Functions can return strings, `Element` instances and even more functions.

## About

Copyright 2016, Mark "Keeto" Obcena. Released under the MIT License.

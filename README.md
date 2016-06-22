Crème
=====

Creme is a simple API for creating and managing DOM elements, built on top of Google's [Incremental DOM](https://github.com/google/incremental-dom).

Creme works by encapsulating the Incremental DOM's rendering functions (e.g., `elementVoid`, `elementOpen`, `patch`, etc.) inside `CremeElement` objects, allowing users to express structure in a more hierarchical manner.

## Example

```js
var creme = require('creme');

var Greeting = creme.div({
  $id: 'greeting',
  'data-lang': 'en'
}, [
  creme.h1('Welcome!'),
  creme.p(creme.interpolate('Hello {name}!')),
  function(data) {
    if (data.username) {
      return creme.p('Your username is ' + data.username);
    }
    return creme.p('We don\'t know your username!');
  }
])

Greeting.patchInto(document.body, {name: 'Mark', username: 'keeto'});

/*
Renders:

<div id="greeting" data-lang="en">
  <h1>Welcome!</h1>
  <p>Hello Mark!</p>
  <p>Your username is keeto</p>
</div>
*/
```

## Installation

```sh
$ npm install --save creme
```

## CremeElements

Creme's main abstraction is the `CremeElement`, which is an object that contains properties and children. For example, you can create a `div` `CremeElement` like so:

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

## Creating Custom CremeElement Factories

You can create a factory an element using the `createElement` function. The following example creates the same `creme.div` function above:

```js
// createElement(tagName, isVoid) -> function(attribs, children)

var createElement = require('creme/lib/create_element');
var div = createElement('div', false);

var element = div('Hello World');
```

## Attributes and Children

All element factories take in two optional arguments:

```
elementFactory(attributes, children) -> CremeElement
```

- `attributes` is key-value map describing the attributes and properties of the element.
- `children` could either be a string (representing a text node), an `CremeElement` created from a factory, or an array containing a mixture of both strings and `CremeElement` instances.

### Special Attributes

When passing an object for the `attributes` argument, most of the fields are passed directly to the underlying Incremental DOM implementation. Creme, however, allows you to specify three special properties that affect how your element gets patched into a container.

#### `$key` and `$static`

The `$key` special attribute is used as a unique identifier for the element. Incremental DOM uses this value during its diff-ing process.

The `$static` special attribute must be key-value map of the static properties of an element. The value of these properties never change in-between renderings. Setting this attribute requires you to pass a `$key` as well.

```js
var myInput = creme.input({
  $key: 'myInput',
  $static: {
    type: 'text'
  },
  disabled: true
});

// Renders <div type="text" disabled="true"></div>
myInput.patchInto(document.body);
```

#### `$events`

The `$events` attribute can be used to attach event listeners to the element. Internally, it calls `addEventListener` on the element.

```js
var myInput = creme.input({
  $events: {
    focus: function(e) {
      // do something
    },
    blur: function(e) {
      // do something
    }
  }
});
```

If you need to add multiple event listeners, you can pass an array of listeners:

```js
var myButton = creme.button({
  $events: {
    click: [
      function(e) {
        // Do something
      },
      function(e) {
        // Do something else
      }
    ]
  }
});
```

#### `$ref`

The special attribute `$ref`--when set to `true`--enables you to access a special property on `CremeElement` instances called `node`, which is a reference to the actual DOM node that was created.

The `node` property is dynamic: when your element is rendered, this property is updated to point to the rendered node. If your element is removed, this property is set to `null`. For elements without the `$ref` or `$id` attributes (see below), this will always be set to `null`.

Because the actual DOM element can change in between renderings, you should *not* store the value of the `node` property. Instead, it is adviced to access the property everytime you need to use it.

```js
var myButton = creme.button({
  $ref: true
});


myButton.patchInto(document.body);

myButton.node; // <button>
```

#### `$id`

Since it's a common usecase to set the `id` property of an element as a `$static` attribute and as the value for `$key`, you can use the `$id` attribute to combine these two. The following declarations are similar:

```js
// Using $key and $static separately
var div = creme.div({
  $key: 'my-id'
  $static: {
    id: 'my-id'
  }
});

var div = creme.div({
  $id: 'my-id'
})
```

The `$id` attribute also automatically sets the `$ref` attribute to `true`:

```js
var myButton = creme.button({
  $id: 'my-button'
});


myButton.patchInto(document.body);

myButton.node; // <button>
```

#### `$computed`

The `$computed` special attribute is a key-value map of properties that will be computed during rendering time.

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

Aside from strings, `CremeElement` instances and arrays, the `children` parameter element factories can also take in functions. These functions are similar to the functions for `$computed` properties, and are called during rendering time with the data that was passed with `patchInto`.

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
/*
Renders:

<div>
  <h1>Welcome!</h1>
  <p>Hello visitor! Welcome to the site!</p>
</div>
*/
```

Functions can return strings, `CremeElement` instances and even more functions. Returning an array from the function will render each of the elements inside the array.

```js
var myList = creme.ul(function(data) {
  return data.todos.map(function(todo, index) {
    return creme.li({$key: index.toString()}, todo);
  });
});

myList.patchInto(document.body, {
  todos: ['Walk the dog.', 'Get milk.']
})
/*
Renders:
<ul>
  <li>Walk the dog.</li>
  <li>Get milk.</li>
</ul>
*/

```

## Interpolation

String interpolation is a common usecase for render-time functions. Creme has a helper interpolation module that creates an interpolator function so you don't have to write one yourself:

```js
var creme = require('creme');
var interpolate = require('creme/lib/interpolate');

var div = creme.div({
  $computed: {
    'class': interpolate('{className}')
  }
}, [
  creme.p(interpolate('Your name is {user.name}.')),
  creme.p(interpolate('You are {user.age} years old.'))
]);

div.patchInto(document.body, {
  className: 'user-info',
  user: {
    name: 'Keeto',
    age: 23
  }
});
/*
Renders:

<div class="user-info">
  <p>Your name is Keeto.</p>
  <p>You are 23 years old.</p>
</div>
*/
```

## About

Copyright 2016, Mark "Keeto" Obcena. Released under the MIT License.

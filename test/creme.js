var creme = require('../index');
var expect = require('expectacle');

describe('Creating Elements', function() {

  var target = null;

  beforeEach(function() {
    target = document.createElement('div');
  });

  afterEach(function() {
    target = null;
  });


  it('should create a single element', function() {
    var div = creme.div();
    div.patchInto(target);
    expect(target.firstChild.tagName).toBe('DIV');
  });

  it('should create an element with a child.', function() {
    var div = creme.div(creme.p());
    div.patchInto(target);
    expect(target.firstChild.tagName).toBe('DIV');
    expect(target.firstChild.firstChild.tagName).toBe('P');
  });

  it('should create an element with children.', function() {
    var div = creme.div([
      creme.p(),
      creme.p()
    ]);
    div.patchInto(target);
    expect(target.firstChild.tagName).toBe('DIV');
    expect(target.firstChild.firstChild.tagName).toBe('P');
    expect(target.firstChild.lastChild.tagName).toBe('P');
  });

  it('should add regular attributes to an element', function() {
    var div = creme.div({'class': 'test'});
    div.patchInto(target);
    expect(target.firstChild.getAttribute('class')).toBe('test');
  });

  it('should add static attributes to an element', function() {
    var div = creme.div({
      $key: 'test',
      $static: {
        'class': 'test'
      }
    });
    div.patchInto(target);
    expect(target.firstChild.getAttribute('class')).toBe('test');
  });

  it('should throw a type error when setting static attributes without a $key', function() {
    expect(function() {
      var div = creme.div({
        $static: {
          'class': 'test'
        }
      });
      div.patchInto(target);
    }).toThrow(TypeError);
  });

  it('should expose a non-null node value if the the item has a $ref attribute', function() {
    var div = creme.div({
      $ref: true
    });
    div.patchInto(target);
    expect(div.node).not.toBe(null);
  });

  it('should set the id property of an element using $id', function() {
    var div = creme.div({$id: 'test'});
    div.patchInto(target);
    expect(target.firstChild.getAttribute('id')).toBe('test');
  });

  it('should expose a non-null node value if the the item has an $id', function() {
    var div = creme.div({
      $id: true
    });
    div.patchInto(target);
    expect(div.node).not.toBe(null);
  });

  it('should call computed attribute functions', function() {
    var div = creme.div({
      $computed: {
        'class': function() {
          return 'testing'
        }
      }
    });
    div.patchInto(target);
    expect(target.firstChild.getAttribute('class')).toBe('testing');
  });

  it('should pass the data when calling a computed attribute', function() {
    var div = creme.div({
      $computed: {
        'class': function(data) {
          if (!data) {
            return 'testing'
          }
          return data.className;
        }
      }
    });
    div.patchInto(target, {className: 'test-class'});
    expect(target.firstChild.getAttribute('class')).toBe('test-class');
  });

  it('should create a text for text children', function() {
    var div = creme.div('Hello');
    div.patchInto(target);
    expect(target.firstChild.firstChild.nodeType).toBe(target.TEXT_NODE);
    expect(target.firstChild.firstChild.textContent).toBe('Hello');
  });

  it('should call a function that is passed as a child', function() {
    var div = creme.div(function() {
      return 'Hello';
    });
    div.patchInto(target);
    expect(target.firstChild.firstChild.nodeType).toBe(target.TEXT_NODE);
    expect(target.firstChild.firstChild.textContent).toBe('Hello');
  });

  it('should render an element returned from a function', function() {
    var div = creme.div(function() {
      return creme.p();
    });
    div.patchInto(target);
    expect(target.firstChild.firstChild.tagName).toBe('P');
  });

  it('should recursively call functions returned from a function', function() {
    var div = creme.div(function() {
      return function() {
        return 'Hello';
      };
    });
    div.patchInto(target);
    expect(target.firstChild.firstChild.nodeType).toBe(target.TEXT_NODE);
    expect(target.firstChild.firstChild.textContent).toBe('Hello');
  });

  it('should pass the data object from patchTo into a child function', function() {
    var div = creme.div(function(data) {
      if (!data) {
        return 'fail'
      }
      return data.type;
    });
    div.patchInto(target, {type: 'pass'});
    expect(target.firstChild.firstChild.nodeType).toBe(target.TEXT_NODE);
    expect(target.firstChild.firstChild.textContent).toBe('pass');
  });

  it('should render a list of items.', function() {
    var todos = ['Walk the dog.', 'Get milk.'];
    var ul = creme.ul(function(data) {
      return data.todos.map(function(todo, index) {
        return creme.li({$key: index.toString()}, todo);
      });
    });

    ul.patchInto(target, {todos: todos})
    expect(target.firstChild.tagName).toBe('UL');
    expect(target.firstChild.firstChild.tagName).toBe('LI');
    expect(target.firstChild.firstChild.textContent).toBe(todos[0]);
    expect(target.firstChild.lastChild.tagName).toBe('LI');
    expect(target.firstChild.lastChild.textContent).toBe(todos[1]);
  });

  it('should add events to an element.', function(done) {
    var item = creme.div({
      $ref: true,
      $events: {
        click: function(e) {
          done();
        }
      }
    });
    item.patchInto(target);
    item.node.click();
  });

});

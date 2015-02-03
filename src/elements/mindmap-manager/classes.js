/* global localforage: false */
(function() {
  'use strict';
  let pseudoRandomKey = function() {
    let str = Math.random().toString(16) + Date.now().toString(16);
    return str.substring(2, str.length);
  };

  let resourcesDB = localforage.createInstance({
    name: 'resources',
    storeName: 'resources'
  });

  let p = Symbol('Private');

  class Content {
    constructor(data) {
      this[p] = new Map();
      this[p].set('data', data);
    }

    get dataAsync() {
      return new Promise(function(resolve) {
        resolve(this[p].get('data'));
      });
    }
  }

  class Text extends Content {
    constructor(text) {
      super(text);
    }
  }

  class Image extends Content {
    constructor(image, name = 'name') {
      let key = name + '-' + pseudoRandomKey();
      resourcesDB.setItem(key, image)
      .then(function() {
        super(key);
      });
    }

    get dataAsync() {
      return resourcesDB.getItem(this[p].get('data'));
    }
  }

  class Node {
    constructor(title, parent = null) {
      this[p] = new Map();
      this[p].set('title', title);
      this[p].set('parent', parent);
      this[p].set('children', new Set());
      this[p].set('content', null);
    }

    get childCount() {
      return this[p].get('children').size;
    }

    addChild(title = 'New node') {
      let node = new Node(title, this);
      this[p].get('children').add(node);
      return node;
    }

    removeChild(node, recursive = true) {
      if (recursive) {
        for (let child of this[p].get('children')) {
          for (let grandChild of child[p].get('children')) {
            child.removeChild(grandChild, true);
          }
        }
      } else {
        //reassign children of child to `this`
      }
      this[p].get('children').delete(node);
    }

    set content(data) {
      let content;
      if (typeof data === 'string') {
        content = new Text(data);
      } else {
        console.warn('not (yet) a supported type');
        content = new Image(data);
      }
      this[p].set('content', content);
    }

    get content() {
      return this[p].get('content');
    }
  }

  class Mindmap {
    constructor(name = 'mindmap') {
      this[p] = new Map();
      this[p].set('name', name);
      this[p].set('created', Date.now());
      this[p].set('lastModified', Date.now());
      this[p].set('root', new Node(name));
    }

    get root() {
      return this[p].get('root');
    }
  }

  document.currentScript.ownerDocument.module = {
    classes: {Mindmap: Mindmap}
  };
})();

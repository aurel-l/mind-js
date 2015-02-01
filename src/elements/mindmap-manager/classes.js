/* global localforage: false */
(function() {
  'use strict';
  let randomKey = function() {
    let str = Math.random().toString(16) + Date.now().toString(16);
    return str.substring(2, str.length);
  };

  let resourcesDB = localforage.createInstance({
    name: 'resources',
    storeName: 'resources'
  });

  class Content {
    constructor(data) {
      this.data = data;
    }

    get dataAsync() {
      return new Promise(function(resolve) {
        resolve(this.data);
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
      let key = name + '-' + randomKey();
      resourcesDB.setItem(key, image)
      .then(function() {
        super(key);
      });
    }

    get dataAsync() {
      return resourcesDB.getItem(this.data);
    }
  }

  class Node {
    constructor(title, parent = null) {
      this.title = title;
      this.parent = parent;
      this.children = new Set();
      this._content = null;
    }

    get childCount() {
      return this.children.size;
    }

    addChild(title = 'New node') {
      let node = new Node(title, this);
      this.children.add(node);
      return node;
    }

    removeChild(node, recursive = true) {
      if (recursive) {
        for (let child of this.children) {
          for (let grandChild of child.children) {
            child.removeChild(grandChild, true);
          }
        }
      } else {
        //reassign children of child to `this`
      }
      this.children.delete(node);
    }

    set content(data) {
      if (typeof data === 'string') {
        this._content = new Text(data);
      } else {
        console.warn('not (yet) a supported type');
        this._content = new Image(data);
      }
    }

    get content() {
      return this._content;
    }
  }

  class Mindmap {
    constructor(name = 'mindmap') {
      this.name = name;
      this.created = Date.now();
      this.lastModified = Date.now();
      this._root = new Node(name);
    }

    get root() {
      return this._root;
    }
  }

  document.currentScript.ownerDocument.module = {
    classes: {Mindmap: Mindmap}
  };
})();

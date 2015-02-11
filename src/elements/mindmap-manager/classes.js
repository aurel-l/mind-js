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

  let resourceKeys;
  resourcesDB.keys().then(keys => resourceKeys = new Set(keys));

  let p;
  try {
    p = Symbol('Private');
  } catch(err) {
    //Symbol not supported
    p = 'Private';
  }

  class Content {
    constructor(data = null) {
      this[p] = new Map();
      this[p].set('data', data);
    }

    get data() {
      return new Promise(resolve => resolve(this[p].get('data')));
    }

    delete() {
      return new Promise(resolve => resolve());
    }
  }

  class Text extends Content {
    constructor(text) {
      super(text);
    }
  }

  class Image extends Content {
    constructor(image, name = 'name') {
      let key = null;
      while (!key || key in resourceKeys) {
        key = name + '-' + pseudoRandomKey();
      }
      resourceKeys.add(key);
      resourcesDB.setItem(key, image);
      super(key);
    }

    get data() {
      return resourcesDB.getItem(this[p].get('data'));
    }

    delete() {
      return resourcesDB.removeItem(this[p].get('data'));
    }
  }

  class Node {
    constructor(title, parent = null) {
      this[p] = new Map();
      this[p].set('title', title);
      this[p].set('parent', parent);
      this[p].set('children', new Set());
      this[p].set('content', new Content());
    }

    get childCount() {
      return this[p].get('children').size;
    }

    addChild(title = 'New node') {
      let node = new Node(title, this);
      this[p].get('children').add(node);
      return node;
    }

    delete(recursive = true) {
      console.log('deleting');
      if (recursive) {
        let promises = [];
        for (let child of this[p].get('children')) {
          promises.push(child.delete());
        }
        console.log(promises);
        return Promise.all(promises).then(() => {
          this[p].get('parent')[p].get('children').delete(this);
          return this[p].get('content').delete();
        });
      } else {
        let parent = this[p].get('parent');
        this[p].get('children').forEach(child => {
          child[p].set('parent', parent);
          parent[p].get('children').add(child);
        });
        parent[p].get('children').delete(this);
        return this[p].get('content').delete();
      }
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
    constructor(name = 'mindmap', object = null) {
      if (object) {
        //todo
      } else {
        this[p] = new Map();
        this[p].set('name', name);
        this[p].set('created', Date.now());
        this[p].set('lastModified', Date.now());
        this[p].set('root', new Node(name));
      }
    }

    get root() {
      return this[p].get('root');
    }
  }

  document.currentScript.ownerDocument.module = {
    classes: {Mindmap: Mindmap}
  };
})();

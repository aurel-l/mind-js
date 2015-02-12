/* global localforage: false */
(function() {
  'use strict';
  let pseudoRandomKey = function() {
    let str = Math.random().toString(16) + Date.now().toString(16);
    return str.substring(2, str.length);
  };

  let resourceDB = localforage.createInstance({
    name: 'resources',
    storeName: 'resources'
  });

  let resourceKeys;
  resourceDB.keys().then(keys => resourceKeys = new Set(keys));

  let Manager = {
    resource: {
      get(key) {
        return resourceDB.getItem(key);
      },
      set(content, meta = {name: 'untitled'}) {
        let key = null;
        while (!key || key in resourceKeys) {
          key = meta.name + '-' + pseudoRandomKey();
        }
        resourceKeys.add(key);
        return resourceDB.setItem(key, {content, meta}).then(() => key);
      }
    }
  };

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
      resourceDB.setItem(key, image);
      super(key);
    }

    get data() {
      return resourceDB.getItem(this[p].get('data'));
    }

    delete() {
      return resourceDB.removeItem(this[p].get('data'));
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
    constructor(name = 'mindmap') {
      this[p] = new Map();
      this[p].set('name', name);
      this[p].set('root', new Node(name));
    }

    get root() {
      return this[p].get('root');
    }
  }

  Mindmap.fromObject = function(object) {
    let mindmap = new Mindmap(object.name);
    mindmap.root[p].set('title', object.root.title);
    return mindmap;
  };

  Mindmap.reinstanciate= function(object) {
    console.log(object);
    let mindmap = new Mindmap(object.name);
    mindmap.root[p].set('title', object.root.title);
    return mindmap;
  };

  Mindmap.clearContents = function() {
    resourceKeys = new Set();
    resourceDB.clear();
  };

  document.currentScript.ownerDocument.module = {
    classes: {Mindmap, Manager}
  };
})();

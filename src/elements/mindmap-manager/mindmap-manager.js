/* global localforage: false */
(function() {
  'use strict';
  class Content {
    constructor(data) {
      this.data = data;
    }

    get getContentAsync() {
        return new Promise(() => {
            return this.data;
        });
    }
  }

  class Text extends Content {
    constructor (text) {
        super(text);
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

    removeChild(node) {
      this.children.delete(node);
    }
    
    set content(data) {
      if (typeof data === 'string') {
        this._content = new Text(data);
      } else {
        console.warn('not (yet) a supported type');
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

  /* placeholder */
  let list = new Array(25);
  for (let i = 0; i < 25; i++) {
    list[i] = {
      name: `Mindmap n°${i + 1}`,
      id: Math.random().toString(),
      date: {
        created: new Date(Date.now() - (Math.round(Math.random() * Math.pow(10, 10)))).toISOString(),
        changed: new Date(Date.now() - (Math.round(Math.random() * Math.pow(10, 8)))).toISOString()
      }
    };
  }

  let db = {
    mm: localforage.createInstance({
      name: 'mindmaps',
      storeName: 'mindmaps'
    }),
    meta: localforage.createInstance({
      name: 'metadata',
      storeName: 'metadata'
    }),
    res: localforage.createInstance({
      name: 'resources',
      storeName: 'resources'
    })
  };

  Polymer({
    ready: function() {
      console.log('ready');
      console.log(this);
      db.mm.getItem(this.getAttribute('key'))
      .then(function(mindmap) {
        if (mindmap === null) {
          console.log('new mindmap');
          var fileImport = false;
          if (fileImport) {
            //
          } else {
            console.log('creating mindmap from scratch');
            mindmap = new Mindmap();
            mindmap.root.content = 'root content';
            console.log(mindmap.root.childCount);
            let node1 = mindmap.root.addChild();
            let node2 = mindmap.root.addChild('node 2');
            mindmap.root.removeChild(node1);
            node2.content = 'content of node 2';
            console.log(mindmap);
          }
        } else {
          console.log(mindmap);
          //Affichage mindmap existante
        }
      }).catch(function(e) {
        console.error(e);
      });
    },
    list: list,
    active: null
  });
})();

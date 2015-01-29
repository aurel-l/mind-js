/* global localforage: false */
(function() {
  'use strict';
  class Content {
    constructor() {

    }
  }

  class Node {
    constructor(title, parent=null) {
      this.title = title;
      this.parent = parent;
      this.children = new Set();
      this.content = new Content();
    }
  }

  class Mindmap {
    constructor(name) {
      this.name = name;
      this.created = Date.now();
      this.lastModified = Date.now();
      let root = new Node();
      this.root = root;
      this.nodes = new Set([root]);
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
            console.log(mindmap);
          }
        } else {
          console.log(mindmap);
          //Affichage mindmap existante
        }
      }).catch(function() {
        console.log('db error');
      });
    },
    list: list,
    active: null
  });
})();

/* global localforage: false */
(function() {
  'use strict';

  let Mindmap = document.currentScript.ownerDocument.module.classes.Mindmap;

  let pseudoRandomKey = function() {
    let str = Math.random().toString(16) + Date.now().toString(16);
    return str.substring(2, str.length);
  };

  let db = {
    mm: localforage.createInstance({
      name: 'mindmaps',
      storeName: 'mindmaps'
    }),
    meta: localforage.createInstance({
      name: 'metadata',
      storeName: 'metadata'
    })
  };

  let metadata = [];
  // iterate through all metadata stored in DB
  db.meta.iterate((value, key) => {
    metadata.push({key, meta: value});
  }).then(() => {
    // sort, last modified first
    metadata.sort((a, b) => new Date(a.meta.date.changed) < new Date(b.meta.date.changed));
    console.log('loaded all existing metadata');
  });

  Polymer({
    ready: function() {
      console.log('manager ready');
      let key = this.getAttribute('key');
      let [meta] = metadata.filter(item => item.key === key);
      if (meta) {
        // open existing mindmap
        db.mm.getItem(key).then(mindmap => {
          //expose mindmap
          this.active = {
            key,
            meta: meta.meta,
            data: mindmap
          };
          console.log(mindmap);
        });
      } else {
        // create new mindamp
        while(!key || metadata.some(item => item.key === key)) {
          //create unique key
          key = pseudoRandomKey();
        }
        console.log(`creating new mindamp with key ${key}`);
        let now = new Date();
        this.active = {
          key,
          meta: {
            name: `new mindmap ${now.toLocaleString()}`,
            date: {
              created: now.toISOString(),
              changed: now.toISOString()
            }
          },
          data: new Mindmap(`new mindmap ${now.toLocaleString()}`)
        };
        metadata.push({key, meta: this.active.meta});
        this.saveActive();
      }
    },
    list: metadata,
    active: null,
    saveActive: function() {
      let [meta] = metadata.filter(item => item.key === this.active.key);
      this.active.meta.date.changed = new Date().toISOString();
      meta.meta = this.active.meta;
      db.meta.setItem(this.active.key, this.active.meta);
      db.mm.setItem(this.active.key, this.active.data);
      console.log(metadata);
    }
  });
})();

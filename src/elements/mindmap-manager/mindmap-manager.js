/* global localforage: false */
/* global fetch: false */
/* global ZSchema: false */
(function() {
  'use strict';

  let {Mindmap, Manager} = document.currentScript.ownerDocument.module.classes;
  console.log(Manager);

  let pseudoRandomKey = function() {
    let str = Math.random().toString(16) + Date.now().toString(16);
    return str.substring(2, str.length);
  };

  let mostRecentFirst = function(a, b) {
    return Date.parse(b.meta.date.changed) - Date.parse(a.meta.date.changed);
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

  let schema;
  let path = document.currentScript.baseURI;
  path = path.substr(0, path.lastIndexOf('/'));
  fetch(path + '/schema')
    .then(response => response.json())
    .then(parsed => schema = parsed);
  let validator = new ZSchema();

  let metadata = [];
  // iterate through all metadata stored in DB
  db.meta.iterate((value, key) => {
    metadata.push({key, meta: value});
  }).then(() => {
    // sort, last modified first
    metadata.sort(mostRecentFirst);
    console.log('loaded all existing metadata');
  });

  Polymer({
    list: metadata,
    load(key) {
      let [meta] = metadata.filter(item => item.key === key);
      return db.mm.getItem(key).then(mindmap => {
        if (!mindmap) {
          throw 'Not an existing mindmap';
        }
        //expose mindmap
        return {
          key,
          meta: meta.meta,
          data: mindmap
        };
      });
    },
    create(file) {
      new Promise(resolve => {
        // create mindmap
        let key;
        while(!key || metadata.some(item => item.key === key)) {
          //create unique key
          key = pseudoRandomKey();
        }
        let now = new Date();
        if (file) {
          let fr = new FileReader();
          fr.readAsText(file);
          fr.addEventListener('load', (loadEvent) => {
            let object = JSON.parse(loadEvent.target.result);
            let valid = validator.validate(schema, object);
            if (valid) {
              resolve({
                key,
                meta: {
                  name: object.name,
                  date: {
                    created: object.created || now.toISOString(),
                    changed: object.changed || now.toISOString()
                  }
                },
                data: object
              });
            } else {
              throw 'invalid json file';
            }
          });
        } else {
          resolve({
            key,
            meta: {
              name: `new mindmap ${now.toLocaleString()}`,
              date: {
                created: now.toISOString(),
                changed: now.toISOString()
              }
            },
            data: new Mindmap(`new mindmap ${now.toLocaleString()}`)
          });
        }
      }).then(mindmap => {
        // store the mindmap
        console.log(mindmap);
        metadata.unshift({key: mindmap.key, meta: mindmap.meta});
        this.save(mindmap);
      }, console.error);
    },
    save(mindmap) {
      let [meta] = metadata.filter(item => item.key === mindmap.key);
      mindmap.meta.date.changed = new Date().toISOString();
      metadata.sort(mostRecentFirst);
      meta.meta = mindmap.meta;
      db.meta.setItem(mindmap.key, mindmap.meta);
      db.mm.setItem(mindmap.key, mindmap.data);
      console.log(metadata);
    },
    clearAll() {
      db.meta.clear();
      db.mm.clear();
      Mindmap.clearContents();
      while (metadata.length > 0) {
        metadata.pop();
      }
    }
  });
})();

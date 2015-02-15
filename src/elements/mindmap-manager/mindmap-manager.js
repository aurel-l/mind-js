/* global localforage: false */
/* global ZSchema: false */
(function() {
  'use strict';

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
    }),
    res: localforage.createInstance({
      name: 'resources',
      storeName: 'resources'
    })
  };

  let resourceKeys;
  db.res.keys().then(keys => resourceKeys = new Set(keys));

  let Manager = {
    resource: {
      get(key) {
        return db.res.getItem(key);
      },
      set(content, meta = {name: 'untitled'}) {
        let key = null;
        while (!key || key in resourceKeys) {
          key = meta.name + '-' + pseudoRandomKey();
        }
        resourceKeys.add(key);
        return db.res.setItem(key, {content, meta}).then(() => key);
      }
    }
  };

  console.log(Manager);

  let mostRecentFirst = function(a, b) {
    return Date.parse(b.meta.date.changed) - Date.parse(a.meta.date.changed);
  };

  let schema = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    description: 'mindmap-schema',
    definitions: {
      node: {
        type: 'object',
        properties: {
          title: {
            type: 'string'
          },
          children: {
            type: 'array',
            items: {$ref: '#/definitions/node'},
            uniqueItems: true
          },
          content: {
            type: 'object',
            properties:{
              data: {
                type: 'string'
              },
              typeContent:{
                type: 'string',
                enum: ['text', 'image', 'video', 'url']
              }
            }
          }
        },
        required: ['title']
      }
    },
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      root: {$ref: '#/definitions/node'}
    },
    required: ['name', 'root']
  };
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
            data: {
              name: `new mindmap ${now.toLocaleString()}`,
              root: {
                title: `new mindmap ${now.toLocaleString()}`,
                children: [],
                parent: null,
                content: {
                  data: 'root node',
                  typeContent: 'text'
                }
              }
            }
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
    clear(key) {
      if (key) {
        db.meta.removeItem(key);
        db.mm.removeItem(key);
        let [meta] = metadata.filter(m => m.key === key);
        metadata.splice(metadata.indexOf(meta), 1);
      } else {
        db.meta.clear();
        db.mm.clear();
        db.res.clear();
        resourceKeys.clear();
        while (metadata.length > 0) {
          metadata.pop();
        }
      }
    }
  });
})();

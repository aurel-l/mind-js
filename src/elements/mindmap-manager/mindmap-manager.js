/* global localforage: false */
(function() {
  'use strict';

  let Mindmap = document.currentScript.ownerDocument.module.classes.Mindmap;

  /* placeholder */
  let list = new Array(25);
  for (let i = 0; i < 25; i++) {
    list[i] = {
      name: `Mindmap n°${i + 1}`,
      key: Math.random().toString(),
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
            let node3 = node2.addChild('image node');
            node3.content = new Blob(['inside the blob'], {type: 'image/png'});
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

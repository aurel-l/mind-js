(function() {
  'use strict';
  let manager;
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    attached() {
      manager.load(this.key).then(mindmap => {
        console.log(mindmap);
      });
      /*if (this.list.some(el => el.key === this.key)) {
        console.log('opening existing mindmap');
      } else {
        console.log('creating new mindmap');
      }*/
    }
  });
})();

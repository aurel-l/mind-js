(function() {
  'use strict';
  Polymer({
    attached: function() {
      if (this.list.some(el => el.key === this.key)) {
        console.log('opening existing mindmap');
      } else {
        console.log('creating new mindmap');
      }
    }
  });
})();

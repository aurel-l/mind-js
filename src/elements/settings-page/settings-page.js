(function() {
  'use strict';
  let manager;
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    //defaults
    settings: {
      general: {
        text1: 'default'
      },
      display: {
        depth: 2
      }
    },
    toggle() {
      this.$['clear-dialog'].toggle();
    },
    clearAll() {
      manager.clearAll();
    }
  });
})();

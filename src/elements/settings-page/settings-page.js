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
    clearAll() {
      if (window.confirm('Are you sure you want to remove all cached data?')) {
        manager.clearAll();
      }
    }
  });
})();

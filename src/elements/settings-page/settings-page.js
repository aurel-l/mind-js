/* global CoreStyle: false */
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
        hue: 200
      },
      display: {
        depth: 10
      }
    },
    toggle() {
      this.$['clear-dialog'].toggle();
    },
    clearAll() {
      manager.clearAll();
    },
    backToDefaults() {
      localStorage.clear();
      location.reload();
    },
    hueChanged(_, __, g) {
      CoreStyle.g.theme.hue = g.immediateValue;
    }
  });
})();

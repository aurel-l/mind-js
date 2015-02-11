(function() {
  'use strict';
  let manager;
  Polymer({
    ready: function() {
      manager = document.querySelector('mindmap-manager');
    },
    toggle: function() {
      this.$.dialog.toggle();
    },
    create: function() {
      manager.create(this.$['file-input'].files[0]);
      this.$['file-input'].value = '';
    }
  });
})();

(function() {
  'use strict';
  let manager;
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    toggle() {
      this.$.dialog.toggle();
    },
    create() {
      manager.create(this.$['file-input'].files[0]);
      this.$['file-input'].value = '';
    }
  });
})();

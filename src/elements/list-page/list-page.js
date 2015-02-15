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
    },
    download(_, __, e) {
      console.log(`action: download json file for mindmap with key ${e.parentElement.dataset.key}`);
      window.alert('not implemented yet');
    },
    modify(_, __, e) {
      console.log(`action: modify metadata for mindmap with key ${e.parentElement.dataset.key}`);
      window.alert('not implemented yet');
    },
    delete(_, __, e) {
      manager.clear(e.parentElement.dataset.key);
    }
  });
})();

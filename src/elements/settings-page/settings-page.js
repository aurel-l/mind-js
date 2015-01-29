(function() {
  'use strict';
  Polymer({
    ready: function() {
        this.settings = {
            text1: localStorage.getItem('text1')
        };
    },
    settingsChanged(oldValue, newValue) {
      console.log(`settings changed from ${oldValue} to ${newValue}`);
    }
  });
})();

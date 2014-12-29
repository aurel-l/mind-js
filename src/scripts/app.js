(function(document) {
  'use strict';

  document.getElementById('auto-binding-template').addEventListener('template-bound', function() {
    // Perform some behaviour
    console.log('Polymer is ready to rock!');

    // Mindmap list
    var mindmapListTmpl = document.getElementById('mindmap-list-template');
    mindmapListTmpl.model = {
      data: new Array(100)
    };
    for (var i = 0; i < 100; i++) {
      mindmapListTmpl.model.data[i] = {value: 'Mindmap n°' + i};
    }
    mindmapListTmpl.parentElement.addEventListener('click', function(e) {
      if (e.target.tagName === 'PAPER-BUTTON') {
        e.target.nextElementSibling.toggle();
      }
    });

    var navicon = document.getElementById('navicon');
    var drawerPanel = document.getElementById('drawer-panel');
    navicon.addEventListener('click', function() {
      drawerPanel.togglePanel();
    });
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));

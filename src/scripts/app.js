((document) => {
  'use strict';
  let t = document.getElementById('auto-binding-template');
  t.addEventListener('template-bound', () => {
    // Mindmap list
    /*t.list = new Array(25);
    for (let i = 0; i < 25; i++) {
      t.list[i] = {
        name: `Mindmap n°${i + 1}`,
        date: {
          created: new Date(Date.now() - (Math.round(Math.random() * Math.pow(10, 10)))).toISOString(),
          changed: new Date(Date.now() - (Math.round(Math.random() * Math.pow(10, 8)))).toISOString()
        }
      };
    }
    t.$['drawer-panel'].addEventListener('core-select', e => {
      if ('setZ' in e.detail.item) {
        e.detail.item.setZ(e.detail.isSelected ? 3 : 1);
      }
    });*/
    /*mindmapListTmpl.parentElement.addEventListener('click', (e) => {
      if (e.target.tagName === 'PAPER-BUTTON') {
        e.target.nextElementSibling.toggle();
      }
    });*/
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));

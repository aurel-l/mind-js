"use strict";!function(){var a=void 0;Polymer({ready:function(){a=document.querySelector("mindmap-manager")},settings:{general:{hue:200},display:{depth:10}},toggle:function(){this.$["clear-dialog"].toggle()},clearAll:function(){a.clearAll()},backToDefaults:function(){localStorage.clear(),location.reload()},hueChanged:function(a,b,c){CoreStyle.g.theme.hue=c.immediateValue}})}();
"use strict";!function(){var a=void 0;Polymer({ready:function(){a=document.querySelector("mindmap-manager")},toggle:function(){this.$.dialog.toggle()},create:function(){a.create(this.$["file-input"].files[0]),this.$["file-input"].value=""},download:function(a,b,c){console.log("action: download json file for mindmap with key "+c.parentElement.dataset.key),window.alert("not implemented yet")},modify:function(a,b,c){console.log("action: modify metadata for mindmap with key "+c.parentElement.dataset.key),window.alert("not implemented yet")},"delete":function(b,c,d){a.clear(d.parentElement.dataset.key)}})}();
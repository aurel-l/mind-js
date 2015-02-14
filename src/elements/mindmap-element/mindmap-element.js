/* global d3: false */
(function() {
  'use strict';
  let manager;
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    attached() {
      manager.load(this.key).then(mindmap => {
        console.log(mindmap);
//comm a mettre debut

        var svg = d3.select(this.$.svg);

        var link = svg.selectAll('.link'),
            node = svg.selectAll('.node'),
            root;






        function tick() {
          link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });

          node.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }


        //var force = d3.layout.force()
        var {width, height} = this.$.svg.getBoundingClientRect();
        var force = d3.layout.force()
            .charge(d => (d.children ? d.children.length + 1 : 1) * -300)
            .linkDistance(d => (d.children ? d.children.length + 1 : 1) * 3)
            .size([width, height])
            .on('tick', tick);



        // Color leaf nodes orange, and packages white or blue.
        function color(d) {
          return d._children ? '#3182bd' : d.children ? '#c6dbef' :'#fd8d3c';
        }

        // Toggle children on click.
        function click(d) {
          if (!event.defaultPrevented) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
              //d.meta = true;
            } else {
              d.children = d._children;
              d._children = null;
              //d.meta = false;
            }
            update();
          }
        }

        // Toggle open content on click.
        let supported = {
          images: new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'apng', 'svg', 'ico']),
          videos: new Set(['ogg', 'ogv', 'ogm', 'webm', 'mp4']),
          audios: new Set(['mp3', 'wav'])
        };
        let generateContent = (content, type) => {
          return new Promise((res, rej) => {
            let html;
            switch (type) {
              case 'text':
                html = document.createElement('p');
                html.innerText = content;
                res(html);
                break;
              case 'url':
                let ext = content.split('.').pop().toLowerCase();
                if (supported.images.has(ext)) {
                  html = document.createElement('img');
                  html.src = content;
                } else if (supported.videos.has(ext)) {
                  html = document.createElement('video');
                  html.controls = true;
                  html.src = content;
                } else if (supported.audios.has(ext)) {
                  html = document.createElement('audio');
                  html.controls = true;
                  html.src = content;
                } else {
                  html = document.createElement('a');
                  html.target = '_blank';
                  html.href = content;
                  html.innerText = content;
                }
                res(html);
                break;
              default:
                rej('unsupported type');
            }
          });
        };
        let clickContent = d => {
          if (!event.defaultPrevented) {
            generateContent(d.content.data, d.content.typeContent)
              .then((content) =>  {
                this.$.content.heading = d.title;
                this.$.content.replaceChild(content, this.$.content.firstElementChild);
                this.$.content.toggle();
              });
          }
        };

        // Returns a list of all nodes under the root.
        function flatten(data) {
          var nodes = [], i = 0;
          root = data;
          root.fixed = true;
          root.x = width / 2;
          root.y = height / 2;
          function recurse(node) {
            if (node.children) {node.children.forEach(recurse);}
            if (!node.id) {node.id = ++i;}
            nodes.push(node);
          }

          recurse(data);
          return nodes;
        }






      function update() {
        var nodes = flatten(mindmap.data.root),
            links = d3.layout.tree().links(nodes);
        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            //.linkDistance(20)
            .start();
        // Update the links…
        link = link.data(links, function(d) { return d.target.title; });

        // Exit any old links.
        link.exit().remove();

        // Enter any new links.
        link.enter().insert('line', '.node')
            .attr('class', 'link')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        // Update the nodes…
        node = node.data(nodes, function(d) { return d.title; }).style('fill', color);
      
        // Exit any old nodes.
        node.exit().remove();
        

        var g = node.enter().append('g')
          .attr('class', 'node')
          .call(force.drag);

        g.append('circle')
          .attr('r', d => Math.sqrt((d.children ? d.children.length + 1 : 1) * 40))
          .style('fill', color)
          .on('click', click);
          
        g.append('text')
          //.attr('x', d => d.x)
          //.attr('y', d => d.y)
          .attr('dx', d => Math.sqrt((d.children ? d.children.length + 1 : 1) * 40))
          .text(d => d.title)
          .on('click', clickContent);

      }


      update();

//comm a finir
      });
    }
  });
})();

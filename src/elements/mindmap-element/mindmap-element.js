/* global d3: false */
/* global CoreStyle: false */
(function() {
  'use strict';
  let manager, currentMindmap, currentUpdate;
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    attached() {
      manager.load(this.key).then(mindmap => {
        console.log(mindmap);
        currentMindmap = mindmap;
        window.mindmap = mindmap;
//comm a mettre debut

        var svg = d3.select(this.$.svg);

        var link = svg.selectAll('.link'),
            node = svg.selectAll('.node'),
            root;






        var {width, height} = this.$.svg.getBoundingClientRect();

        function tick() {
          node
            .attr('cx', d => d.x = Math.max(5, Math.min(width - 5, d.x)))
            .attr('cy', d => d.y = Math.max(5, Math.min(height - 5, d.y)));

          link
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

          node.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }


        //var force = d3.layout.force()
        var force = d3.layout.force()
          .gravity(0.01)
          .charge(d => (d.children ? d.children.length + 1 : 1) * -300)
          .linkDistance(d => (d.children ? d.children.length + 1 : 1) * 3)
          .size([width, height])
          .on('tick', tick);



        // Color leaf nodes orange, and packages white or blue.
        function color(d) {
          let hue = CoreStyle.g.theme.hue;
          if (d.fixed) {
            //root
            return d3.hsl((hue + 160) % 360, 0.8, 0.4);
          }
          if (!d.children) {
            //leaf
            return d3.hsl((hue + 200) % 360, 0.5, 0.4);
          }
          if (d._children) {
            //node with hidden children
            return d3.hsl(hue, 0.5, 0.4);
          } else {
            //node with visible children
            return d3.hsl(hue, 0.8, 0.4);
          }
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
            let html = document.createElement('div');
            html.setAttribute('vertical', true);
            html.setAttribute('layout', true);
            html.setAttribute('center', true);
            switch (type) {
              case 'text':
                html.innerText = content;
                break;
              case 'url':
                let a = document.createElement('a');
                a.target = '_blank';
                a.href = content;
                a.innerText = content;
                html.appendChild(a);
                let ext = content.split('.').pop().toLowerCase();
                if (supported.images.has(ext)) {
                  let img = document.createElement('img');
                  img.src = content;
                  html.appendChild(img);
                } else if (supported.videos.has(ext)) {
                  let video = document.createElement('video');
                  video.controls = true;
                  video.src = content;
                  html.appendChild(video);
                } else if (supported.audios.has(ext)) {
                  let audio = document.createElement('audio');
                  audio.controls = true;
                  audio.src = content;
                  html.appendChild(audio);
                }
                break;
              default:
                html = null;
            }
            if (html) {
              res(html);
            } else {
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
                this.$.content.mindmapNode = d;
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
            node.id = ++i;
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
          .attr('dx', d => Math.sqrt((d.children ? d.children.length + 1 : 1) * 40))
          .text(d => d.title)
          .style('fill', color)
          .on('click', clickContent);

      }
      currentUpdate = update;


      update();

//comm a finir
      });
    },
    delete(_, __, button) {
      let trash = button.parentElement.mindmapNode;
      let recurse = node => {
        if (node.children) {
          let i = node.children.indexOf(trash);
          if (i > -1) {
            node.children.splice(i, 1);
          }
          node.children.forEach(recurse);
        }
      };
      recurse(currentMindmap.data.root);
      currentUpdate();
    },
    addChild(_, __, button) {
      let parent = button.parentElement.mindmapNode;
      if (!parent.children) {
        parent.children = [];
      }
      console.log(parent.children);
      parent.children.push({
        title: 'new node',
        content: {
          data: 'new node content',
          typeContent: 'text'
        }
      });
      console.log(parent.children);
      currentUpdate();
    }
  });
})();

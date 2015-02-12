(function() {
  'use strict';
  let manager;
  let d3 = document.currentScript.ownerDocument.module.d3;
  console.log(d3);
  Polymer({
    ready() {
      manager = document.querySelector('mindmap-manager');
    },
    attached() {
      manager.load(this.key).then(mindmap => {
        console.log(mindmap);
//comm a mettre debut
        var width = 960,
            height = 500,
            data = mindmap;

        

        var svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height);

        var link = svg.selectAll('.link'),
            node = svg.selectAll('.node');

        

          

          

        
        function tick() {
          link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });

          node.attr('cx', function(d) { return d.x; })
              .attr('cy', function(d) { return d.y; });
        }


        //var force = d3.layout.force()
        var force = force()
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
            } else {
              d.children = d._children;
              d._children = null;
            }
            update();
          }
        }

        // Returns a list of all nodes under the root.
        function flatten(data) {
          var nodes = [], i = 0;
          console.log(data);
          function recurse(node) {
            console.log(node);
            if (node.children) {node.children.forEach(recurse);}
            if (!node.id) {node.id = ++i;}
            nodes.push(node);
          }

          recurse(data);
          return nodes;
        }






      function update() {
        var nodes = flatten(data.root),
            links = d3.layout.tree().links(nodes);
        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();
      console.log(nodes);

        // Update the links…
        link = link.data(links, function(d) { return d.target.id; });

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
        node = node.data(nodes, function(d) { return d.id; }).style('fill', color);
      console.log('node', node.content);
        // Exit any old nodes.
        node.exit().remove();

        // Enter any new nodes.
        node.enter().append('circle')
            .attr('class', 'node')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('r', function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
            .style('fill', color)
            .on('click', click)
            .call(force.drag);
}




      update();

//comm a finir
      });
      /*if (this.list.some(el => el.key === this.key)) {
        console.log('opening existing mindmap');
      } else {
        console.log('creating new mindmap');
      }*/
    }
  });
})();

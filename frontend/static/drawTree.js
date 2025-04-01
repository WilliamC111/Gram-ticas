const drawTree = {
    generateTree: function () {
      document.getElementById('generateDerivationsBtn').disabled = true;
      Grammar.generateGrammar();

      // Obtengo el json con la abstraccion
      const dataTree = treeData.generateTreeData();
  
      // Seleccionar el SVG dentro del contenedor
      let svgContainer = d3.select('#derivationTree');
      let svg = svgContainer.select('svg');
  
      // Limpiar el SVG
      svg.selectAll('*').remove();
  
      // Obtener las dimensiones del contenedor
      let containerWidth = svgContainer.node().getBoundingClientRect().width;
      let containerHeight = svgContainer.node().getBoundingClientRect().height;
  
      // Asegurarse de que el SVG ocupe todo el espacio disponible
      svg.attr('width', containerWidth).attr('height', containerHeight);
  
      // Calcular los márgenes
      let margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      };
  
      // Calcular el área de dibujo disponible
      let width = containerWidth - margin.left - margin.right;
      let height = containerHeight - margin.top - margin.bottom;
  
      // Crear grupo principal con posición centralizada y margen
      let g = svg
        .append('g')
        .attr(
          'transform',
          `translate(${width / 2 + margin.left}, ${margin.top})`,
        );
  
      // Configurar el layout del árbol ajustado al espacio disponible
      let treeLayout = d3
        .tree()
        .size([width - 100, height - 50])
        .nodeSize([40, 60]); // Ajustar tamaño de los nodos para evitar solapamiento
  
      // Crear la jerarquía a partir de los datos
      let root = d3.hierarchy(dataTree);
  
      // Aplicar el layout
      treeLayout(root);
  
      // Función de zoom
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });
  
      // Aplicar zoom al SVG
      svg.call(zoom);
  
      // Dibujar las líneas (enlaces) entre nodos
      let link = g
        .selectAll('.link')
        .data(root.links())
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
  
      // Dibujar los nodos
      let node = g
        .selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.x},${d.y})`);
  
      // Añadir círculos a los nodos
      node.append('circle').attr('r', 20);
  
      // Añadir texto a los nodos
      node
        .append('text')
        .attr('dy', 5)
        .attr('text-anchor', 'middle')
        .text((d) => d.data.name);
  
      // Centrar inicialmente el árbol
      let initialTransform = d3.zoomIdentity
        .translate(containerWidth / 2 - width / 2, 0)
        .scale(0.8);
  
      svg.call(zoom.transform, initialTransform);
  
      // Ajustar el tamaño cuando cambia el tamaño de la ventana
      window.addEventListener('resize', this.resizeTree);
    },
  
    // Función para redimensionar el árbol cuando cambia el tamaño de la ventana
    resizeTree: function () {
      // Recalcular después de un breve retraso para manejar múltiples eventos de resize
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.generateTree();
      }, 250);
    },
  };
  
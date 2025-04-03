const drawTree = {
  generateTree: function () {
    document.getElementById('generateDerivationsBtn').disabled = true;
    Grammar.generateGrammar();

    const dataTree = treeData.generateTreeData();

    if (!dataTree) {
      d3.select('#derivationTree').select('svg').selectAll('*').remove();

      d3.select('#derivationTree')
        .select('svg')
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'error-message')
        .text('No se pudo generar el árbol de derivación para esta cadena');

      return;
    }

    let svgContainer = d3.select('#derivationTree');
    let svg = svgContainer.select('svg');
    svg.selectAll('*').remove();

    let containerWidth = svgContainer.node().getBoundingClientRect().width;
    let containerHeight = 600;

    svg.attr('width', containerWidth).attr('height', containerHeight);

    let margin = {
      top: 40,
      right: 40,
      bottom: 60,
      left: 40,
    };

    let width = containerWidth - margin.left - margin.right;
    let height = containerHeight - margin.top - margin.bottom;

    let g = svg
      .append('g')
      .attr('class', 'tree-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tree-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(25, 118, 210, 0.9)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '6px')
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.2)')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity 0.3s ease-in-out')
      .style('z-index', 1000);

    let root = d3.hierarchy(dataTree);

    const leafCount = root.leaves().length;
    const treeWidth = Math.max(width, leafCount * 60);

    let treeLayout = d3.tree().size([treeWidth, height - 20]);

    treeLayout(root);

    g.append('rect')
      .attr('width', treeWidth + 100)
      .attr('height', height + 40)
      .attr('x', -50)
      .attr('y', -20)
      .attr('fill', 'url(#tree-gradient)')
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('opacity', 0.3);

    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'tree-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f8f9fa')
      .attr('stop-opacity', 1);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#e9ecef')
      .attr('stop-opacity', 1);

    const linkGenerator = d3
      .linkVertical()
      .x((d) => d.x)
      .y((d) => d.y);

    let link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#bdbdbd')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', function () {
        return this.getTotalLength();
      })
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .attr('stroke-dashoffset', 0);

    let node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr(
        'class',
        (d) => `node ${d.children ? 'node--internal' : 'node--leaf'}`,
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(300)
          .attr('r', d.data.name.length > 1 ? 28 : 22)
          .attr('stroke-width', 3)
          .attr('filter', 'url(#glow)');

        g.selectAll('.link')
          .filter((link) => link.source === d || link.target === d)
          .transition()
          .duration(300)
          .attr('stroke', '#1976D2')
          .attr('stroke-width', 3);

        tooltip.transition().duration(200).style('opacity', 0.95);

        tooltip
          .html(
            `
            <div style="text-align: center; margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 16px;">${
                d.data.name
              }</span>
            </div>
            ${
              d.parent
                ? `<div><strong>Padre:</strong> ${d.parent.data.name}</div>`
                : ''
            }
            ${
              d.children
                ? `<div><strong>Hijos:</strong> ${d.children.length}</div>`
                : ''
            }
            <div style="margin-top: 5px; font-size: 12px; color: #e0e0e0;">
              ${
                d.data.name.length === 1 &&
                d.data.name === d.data.name.toLowerCase()
                  ? 'Terminal'
                  : 'No terminal'
              }
            </div>
          `,
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(300)
          .attr('r', (d) => (d.data.name.length > 1 ? 25 : 20))
          .attr('stroke-width', 2)
          .attr('filter', null);

        g.selectAll('.link')
          .transition()
          .duration(300)
          .attr('stroke', '#bdbdbd')
          .attr('stroke-width', 2);

        tooltip.transition().duration(500).style('opacity', 0);
      });

    const defs = svg.append('defs');

    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    node
      .append('circle')
      .attr('fill', (d) => {
        if (d.data._isRoot) {
          return '#ec407a';
        } else if (d.data.isTerminal) {
          return '#26c6da';
        } else {
          return '#7e57c2';
        }
      })
      .attr('stroke', (d) => {
        if (d.data._isRoot) {
          return '#d81b60';
        } else if (d.data.isTerminal) {
          return '#00acc1';
        } else {
          return '#5e35b1';
        }
      })
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('r', (d) => (d.data.name === d.data.name.toLowerCase() ? 20 : 25));

    node
      .append('text')
      .attr('dy', '.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', (d) => (d.data.name.length > 1 ? '14px' : '16px'))
      .text((d) => d.data.name)
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 300)
      .style('opacity', 1);

    node
      .filter((d) => d.depth > 0 && d.children)
      .append('circle')
      .attr('r', (d) => (d.data.name.length > 1 ? 32 : 28))
      .attr('fill', 'none')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom).on('dblclick.zoom', null);
    const rootX = root.x;
    const rootY = root.y;

    const initialTransform = d3.zoomIdentity
      .translate(containerWidth / 2 - rootX, 70 - rootY)
      .scale(0.85);

    svg.call(zoom.transform, initialTransform);

    const grid = g.append('g').attr('class', 'grid').lower();

    const gridSize = 30;
    const gridWidth = treeWidth + 200;
    const gridHeight = height + 100;

    for (let x = 0; x < gridWidth; x += gridSize) {
      grid
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', gridHeight)
        .attr('stroke', '#f0f0f0')
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay(x / 10)
        .attr('opacity', 0.5);
    }

    for (let y = 0; y < gridHeight; y += gridSize) {
      grid
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', gridWidth)
        .attr('y2', y)
        .attr('stroke', '#f0f0f0')
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay(y / 10)
        .attr('opacity', 0.5);
    }

    const controls = svg
      .append('g')
      .attr('class', 'controls')
      .attr('transform', `translate(20, 20)`);

    controls
      .append('rect')
      .attr('width', 195)
      .attr('height', 45)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))');

    const zoomIn = controls
      .append('g')
      .attr('class', 'control-button')
      .attr('transform', 'translate(25, 22.5)')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      });

    zoomIn
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#7e57c2')
      .attr('stroke', '#5e35b1')
      .attr('stroke-width', 2)
      .attr('class', 'control-circle');

    zoomIn
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '16px')
      .text('+');

    const zoomOut = controls
      .append('g')
      .attr('class', 'control-button')
      .attr('transform', 'translate(70, 22.5)')
      .on('click', () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
      });

    zoomOut
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#7e57c2')
      .attr('stroke', '#5e35b1')
      .attr('stroke-width', 2)
      .attr('class', 'control-circle');

    zoomOut
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '18px')
      .text('−');

    const reset = controls
      .append('g')
      .attr('class', 'control-button')
      .attr('transform', 'translate(115, 22.5)')
      .on('click', () => {
        svg.transition().duration(750).call(zoom.transform, initialTransform);
      });

    reset
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#7e57c2')
      .attr('stroke', '#5e35b1')
      .attr('stroke-width', 2)
      .attr('class', 'control-circle');

    reset
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('⟲');

    const fitScreen = controls
      .append('g')
      .attr('class', 'control-button')
      .attr('transform', 'translate(160, 22.5)')
      .on('click', () => {
        const bounds = g.node().getBBox();
        const dx = bounds.width;
        const dy = bounds.height;
        const x = bounds.x;
        const y = bounds.y;

        const scale = Math.min(0.9, Math.min(width / dx, height / dy));

        const translate = [
          (width - scale * dx) / 2 - scale * x + margin.left,
          (height - scale * dy) / 2 - scale * y + margin.top,
        ];

        svg
          .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
          );
      });

    fitScreen
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#7e57c2')
      .attr('stroke', '#5e35b1')
      .attr('stroke-width', 2)
      .attr('class', 'control-circle');

    fitScreen
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('↔');

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${containerWidth - 150}, 20)`);

    legend
      .append('rect')
      .attr('width', 130)
      .attr('height', 90)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))');

    const terminalLegend = legend
      .append('g')
      .attr('transform', 'translate(15, 20)');

    terminalLegend
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#26c6da')
      .attr('stroke', '#00acc1')
      .attr('stroke-width', 2);

    terminalLegend
      .append('text')
      .attr('x', 20)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .text('Terminal');

    const nonTerminalLegend = legend
      .append('g')
      .attr('transform', 'translate(15, 45)');

    nonTerminalLegend
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#7e57c2')
      .attr('stroke', '#5e35b1')
      .attr('stroke-width', 2);

    nonTerminalLegend
      .append('text')
      .attr('x', 20)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .text('No terminal');

    const rootLegend = legend
      .append('g')
      .attr('transform', 'translate(15, 70)');

    rootLegend
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#ec407a')
      .attr('stroke', '#d81b60')
      .attr('stroke-width', 2);

    rootLegend
      .append('text')
      .attr('x', 20)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .text('Raíz');

    const style = document.createElement('style');
    style.textContent = `
      .link {
        transition: stroke 0.3s, stroke-width 0.3s;
      }
      .node circle {
        transition: r 0.3s, fill 0.3s, stroke 0.3s;
      }
      .node:hover circle {
        cursor: pointer;
      }
      .control-button .control-circle {
        transition: fill 0.3s, transform 0.3s;
      }
      .control-button:hover .control-circle {
        fill: #9575cd;
        transform: scale(1.1);
        cursor: pointer;
      }
      .error-message {
        fill: #f44336;
        font-size: 16px;
        font-weight: bold;
      }
      .tree-tooltip {
        transition: opacity 0.3s;
      }
      #derivationTree {
        background-color: #fcfcfc;
        border-radius: 8px;
        transition: box-shadow 0.3s;
      }
      #derivationTree:hover {
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      }
    `;
    document.head.appendChild(style);

    document.getElementById('generateDerivationsBtn').disabled = false;

    window.removeEventListener('resize', this.debounceResize);
    window.addEventListener('resize', this.debounceResize);
  },

  debounceResize: function () {
    clearTimeout(drawTree.resizeTimer);
    drawTree.resizeTimer = setTimeout(() => {
      drawTree.generateTree();
    }, 250);
  },

  resizeTree: function () {
    this.debounceResize();
  },

  cleanup: function () {
    d3.selectAll('.tree-tooltip').remove();
    window.removeEventListener('resize', this.debounceResize);
  },
};

window.addEventListener('unload', drawTree.cleanup);

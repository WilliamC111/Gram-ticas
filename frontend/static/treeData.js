const treeData = {
  generateTreeData: function() {
    const rules = parseProductions.generateParse();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    console.log('Parsed rules:', rules);
    console.log('Start symbol:', startSymbol);
    console.log('Input string:', inputString);

    const chart = new Map();
    const maxDepth = inputString.length * 2 + 10; // Límite para evitar recursión infinita

    const tree = this.deriveString(
      rules,
      startSymbol,
      inputString,
      0,
      inputString.length,
      chart,
      maxDepth
    );

    if (tree) {
      tree._isRoot = true;
      return tree;
    }

    return null;
  },

  deriveString: function(rules, symbol, input, start, end, chart, remainingDepth) {
    if (remainingDepth <= 0) return null;
    
    const key = `${symbol}:${start}:${end}`;
    if (chart.has(key)) {
      return chart.get(key);
    }

    // Caso base para terminales
    if (!rules[symbol]) {
      if (start < end && input[start] === symbol) {
        const node = { name: symbol, children: [] };
        chart.set(key, node);
        return node;
      }
      chart.set(key, null);
      return null;
    }

    // Probar cada producción posible
    for (const production of rules[symbol]) {
      if (production === "λ") {
        if (start === end) {
          const node = { name: "λ", children: [] };
          chart.set(key, node);
          return node;
        }
        continue;
      }

      const symbols = production.split(/\s+/).filter(s => s.length > 0);
      const result = this.matchProduction(
        rules,
        symbols,
        input,
        start,
        end,
        chart,
        remainingDepth - 1
      );
      
      if (result) {
        const node = { name: symbol, children: result };
        chart.set(key, node);
        return node;
      }
    }

    chart.set(key, null);
    return null;
  },

  matchProduction: function(rules, symbols, input, start, end, chart, remainingDepth) {
    if (symbols.length === 0) {
      return start === end ? [] : null;
    }

    if (symbols.length === 1) {
      const subtree = this.deriveString(
        rules,
        symbols[0],
        input,
        start,
        end,
        chart,
        remainingDepth
      );
      return subtree ? [subtree] : null;
    }

    // Para múltiples símbolos, probar todas las particiones posibles
    for (let mid = start; mid <= end; mid++) {
      const firstPart = this.deriveString(
        rules,
        symbols[0],
        input,
        start,
        mid,
        chart,
        remainingDepth
      );
      
      if (firstPart) {
        const restParts = this.matchProduction(
          rules,
          symbols.slice(1),
          input,
          mid,
          end,
          chart,
          remainingDepth
        );
        
        if (restParts) {
          return [firstPart, ...restParts];
        }
      }
    }

    return null;
  }
};
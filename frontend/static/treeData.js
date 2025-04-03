const treeData = {
  generateTreeData: function () {
    const rules = parseProductions.generateParse();
    const startSymbol = document.getElementById('start_symbol').value.trim();
    const inputString = document.getElementById('input_string').value.trim();

    console.log('Parsed rules:', rules); // Debug output
    console.log('Start symbol:', startSymbol);
    console.log('Input string:', inputString);

    const chart = new Map();

    const tree = this.deriveString(
      rules,
      startSymbol,
      inputString,
      0,
      inputString.length,
      chart,
    );

    console.log('Generated tree:', tree);
    return tree
      ? {
          ...tree,
          _isRoot: true,
        }
      : null;
  },

  deriveString: function (rules, symbol, input, start, end, chart) {
    const key = `${symbol}:${start}:${end}`;
    if (chart.has(key)) {
      return chart.get(key);
    }

    if (!rules[symbol]) {
      if (start + 1 === end && input[start] === symbol) {
        const node = { name: symbol, children: [] };
        chart.set(key, node);
        return node;
      }
      chart.set(key, null);
      return null;
    }

    for (const production of rules[symbol]) {
      const symbols = production.split(/\s+/).filter((s) => s.length > 0);

      if (symbols.length === 0) continue;

      const result = this.matchProduction(
        rules,
        symbols,
        input,
        start,
        end,
        chart,
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

  matchProduction: function (rules, symbols, input, start, end, chart) {
    if (symbols.length === 1) {
      const subtree = this.deriveString(
        rules,
        symbols[0],
        input,
        start,
        end,
        chart,
      );
      return subtree ? [subtree] : null;
    }

    return this.partitionInput(rules, symbols, input, start, end, 0, [], chart);
  },

  partitionInput: function (
    rules,
    symbols,
    input,
    start,
    end,
    symbolIndex,
    result,
    chart,
  ) {
    if (symbolIndex === symbols.length) {
      return start === end ? result : null;
    }

    for (let mid = start + 1; mid <= end; mid++) {
      const subtree = this.deriveString(
        rules,
        symbols[symbolIndex],
        input,
        start,
        mid,
        chart,
      );

      if (subtree) {
        const remaining = this.partitionInput(
          rules,
          symbols,
          input,
          mid,
          end,
          symbolIndex + 1,
          [...result, subtree],
          chart,
        );

        if (remaining) {
          return remaining;
        }
      }
    }

    return null;
  },
};

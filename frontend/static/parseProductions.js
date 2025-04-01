const parseProductions = {
    generateParse: function() {
      const grammar = document.getElementById('generatedGrammar').textContent;
      const productions = {};
      const lines = grammar.split("\n");
  
      let insideProductions = false;
      for (let line of lines) {
        line = line.trim();
  
        if (line.startsWith("P = {")) {
          insideProductions = true;
          continue;
        }
        if (insideProductions && line.startsWith("}")) {
          break;
        }
  
        if (insideProductions && line.includes("→")) {
          // Dividir la línea en el lado izquierdo y derecho de la flecha
          let parts = line.split("→");
          let left = parts[0].trim();
          let right = parts[1].trim();
  
          // Asegurarse de que hay un array para este símbolo no terminal
          if (!productions[left]) {
            productions[left] = [];
          }
  
          // Añadir la producción a la lista
          productions[left].push(right);
        }
      }
  
      // Convertir producciones con múltiples opciones separadas por |
      const finalProductions = {};
      for (const [nonTerminal, prods] of Object.entries(productions)) {
        finalProductions[nonTerminal] = [];
        
        for (const prod of prods) {
          // Si la producción contiene opciones separadas por |
          if (prod.includes("|")) {
            const options = prod.split("|").map(opt => opt.trim());
            finalProductions[nonTerminal].push(...options);
          } else {
            finalProductions[nonTerminal].push(prod);
          }
        }
      }
  
      // La salida es un objeto donde las claves son los símbolos no terminales
      // y los valores son arrays de producciones posibles
      return finalProductions;
    }
  };
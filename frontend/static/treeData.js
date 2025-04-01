const treeData = {
    generateTreeData: function () {
      // Obtengo mis producciones parseadas
      const rules = parseProductions.generateParse();
      const symbol = document.getElementById('start_symbol').value.trim();
      const word = document.getElementById('input_string').value.trim();
      
      // Usamos un enfoque más robusto para la derivación
      function derive(symbol, targetWord, history, remainingPath = []) {
        // Evitar recursión infinita
        if (history.length > 100) return null;
        
        // Caso base: si el símbolo es terminal, verificar si coincide con el inicio de la palabra
        if (!rules[symbol]) {
          if (targetWord.startsWith(symbol)) {
            return { 
              name: symbol, 
              children: [],
              consumedLength: symbol.length
            };
          }
          return null;
        }
        
        // Verificar todas las producciones para este símbolo
        for (let production of rules[symbol]) {
          const parts = production.split(" ").filter(part => part.length > 0);
          
          // Intentar hacer coincidir esta producción con la palabra
          const result = matchProduction(parts, targetWord, [...history, symbol]);
          if (result) {
            return {
              name: symbol,
              children: result.children,
              consumedLength: result.consumedLength
            };
          }
        }
        
        return null;
      }
  
      function matchProduction(parts, targetWord, history) {
        let children = [];
        let remainingWord = targetWord;
        let totalConsumed = 0;
        
        // Intentar hacer coincidir cada parte de la producción
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          
          // Derivar esta parte (ya sea terminal o no terminal)
          const subtree = derive(part, remainingWord, history);
          
          // Si no podemos derivar esta parte, esta producción no funciona
          if (!subtree) return null;
          
          children.push(subtree);
          const consumed = subtree.consumedLength;
          
          // Actualizar la palabra restante y el total consumido
          remainingWord = remainingWord.substring(consumed);
          totalConsumed += consumed;
        }
        
        // Si no hemos consumido toda la palabra objetivo, esta derivación no es válida
        if (children.length > 0 && totalConsumed === targetWord.length) {
          return {
            children: children,
            consumedLength: totalConsumed
          };
        }
        
        return null;
      }
      
      // Generar el árbol de derivación
      const tree = derive(symbol, word, []);
      
      // Limpiar el árbol para la visualización (eliminar propiedades auxiliares)
      function cleanTree(node) {
        if (!node) return null;
        
        const cleanNode = {
          name: node.name,
          children: []
        };
        
        if (node.children && node.children.length > 0) {
          cleanNode.children = node.children.map(child => cleanTree(child));
        }
        
        return cleanNode;
      }
      
      return tree ? cleanTree(tree) : null;
    },
  };
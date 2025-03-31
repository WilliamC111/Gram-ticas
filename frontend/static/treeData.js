const treeData = {
    generateTreeData:function () {

        //obtengo mi producciones parseadas 
        const rules = parseProductions.generateParse();
        const symbol = document.getElementById('start_symbol').value.trim();
        const word = document.getElementById('input_string').value.trim();
        

        function derive(symbol, word, history) {
            if (history.length > word.length + 5) return null;
    
            if (!rules[symbol]) {
                return word === symbol ? { name: symbol, children: [] } : null;
            }
    
            for (let production of rules[symbol]) {
                let words = word.split('');
                let result = matchProduction(production.split(" "), words, history);
    
                if (result) {
                    return { name: symbol, children: result };
                }
            }
    
            return null;
        }
    
        function matchProduction(production, words, history) {
            let children = [];
            let currentIndex = 0;
    
            for (let part of production) {
                if (rules[part]) {
                    let subtree = derive(part, words.slice(currentIndex).join(""), [...history, part]);
                    if (!subtree) return null;
                    children.push(subtree);
                    currentIndex += subtree.children.length || 1;
                } else {
                    if (words[currentIndex] === part) {
                        children.push({ name: part, children: [] });
                        currentIndex++;
                    } else {
                        return null;
                    }
                }
            }
    
            return children;
        }
        //document.getElementById('generatedGrammar').textContent = JSON.stringify(derive(symbol, word, []) || null);
        //retorno un json con la informacion de mis padres e hijos, abstrayendo la informacion 
        return derive(symbol, word, []) || null;
    },
};



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
                let [left, right] = line.split("→").map(s => s.trim());
    
                if (!productions[left]) {
                    productions[left] = [];
                }
    
                productions[left].push(right);
            }
        }

        //document.getElementById('generatedGrammar').textContent = JSON.stringify(productions);
        //retorna el parseo del diccionario de producciones que se necesita para armar mi arbol
        return productions;

    },
};
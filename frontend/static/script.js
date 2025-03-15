document.addEventListener('DOMContentLoaded', function () {
    const productionsTable = document.getElementById('productionsTable').getElementsByTagName('tbody')[0];
    const addProductionBtn = document.getElementById('addProductionBtn');
    const generateGrammarBtn = document.getElementById('generateGrammarBtn');
    const evaluateGrammarBtn = document.getElementById('evaluateGrammarBtn');
    const generateDerivationsBtn = document.getElementById('generateDerivationsBtn');
    const generatedGrammar = document.getElementById('generatedGrammar');
    const resultDiv = document.getElementById('result');
    const derivationsDiv = document.getElementById('derivations');
    const grammarTypeDiv = document.getElementById('grammarType');
    const derivationTreeDiv = document.getElementById('derivationTree');

  
    generateGrammarBtn.textContent = 'Mostrar Gramática';

    // Agregar una nueva fila para producciones
    addProductionBtn.addEventListener('click', function () {
        const newRow = productionsTable.insertRow();
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);

        cell1.innerHTML = '<input type="text" class="variable-input" placeholder="Ejemplo: S">';
        cell2.textContent = '→';
        cell3.innerHTML = '<input type="text" class="production-input" placeholder="Ejemplo: aB | b">';
    });

    // Mostrar la gramática en formato estructurado
    generateGrammarBtn.addEventListener('click', function () {
        const variables = new Set(); // Para almacenar variables (no terminales)
        const terminals = new Set(); // Para almacenar terminales
        const productions = []; // Para almacenar producciones

        const rows = productionsTable.getElementsByTagName('tr');
        for (let row of rows) {
            const variable = row.getElementsByClassName('variable-input')[0].value.trim();
            const production = row.getElementsByClassName('production-input')[0].value.trim();

            if (variable) {
                variables.add(variable); // Agregar variable al conjunto de variables

                if (production) {
                    // Dividir las producciones por "|"
                    const productionList = production.split('|').map(p => p.trim());
                    for (const prod of productionList) {
                        productions.push(`${variable} → ${prod}`);
                        // Extraer terminales de la producción
                        for (const char of prod) {
                            if (char.match(/[a-z]/)) { // Si es una letra minúscula, es un terminal
                                terminals.add(char);
                            }
                        }
                    }
                } else {
                    productions.push(`${variable} → λ`); // Si no hay producción, asumimos λ
                }
            }
        }

        // Obtener el axioma inicial (primera variable ingresada)
        const startSymbol = variables.values().next().value;

        // Construir la gramática en formato estructurado
        const grammarText = `
T = (${Array.from(terminals).join(', ')})
N = (${Array.from(variables).join(', ')})
S = ${startSymbol}
P = {
    ${productions.join('\n    ')}
}`;

        // Mostrar la gramática en el elemento generatedGrammar
        generatedGrammar.textContent = grammarText;
    });

    // Evaluar la gramática
    evaluateGrammarBtn.addEventListener('click', function () {
        const grammar = generatedGrammar.textContent.trim();
        const startSymbol = document.getElementById('start_symbol').value.trim();
        const inputString = document.getElementById('input_string').value.trim();

        fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grammar: grammar,
                start_symbol: startSymbol,
                input_string: inputString,
            }),
        })
        .then(response => response.json())
        .then(data => {
            resultDiv.textContent = `Resultado: ${data.result ? 'Válida' : 'No válida'}`;
            derivationsDiv.textContent = `Derivaciones: ${JSON.stringify(data.derivations)}`;
            grammarTypeDiv.textContent = `Tipo de Gramática: ${data.grammar_type}`;
        });
    });

    // Generar derivaciones y mostrar el árbol de derivación
    generateDerivationsBtn.addEventListener('click', function () {
        const grammar = generatedGrammar.textContent.trim();
        const startSymbol = document.getElementById('start_symbol').value.trim();
        const inputString = document.getElementById('input_string').value.trim();

        fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grammar: grammar,
                start_symbol: startSymbol,
                input_string: inputString,
            }),
        })
        .then(response => response.json())
        .then(data => {
            derivationsDiv.textContent = `Derivaciones: ${JSON.stringify(data.derivations)}`;

            // Mostrar el árbol de derivación si la gramática es de Tipo 2 o Tipo 3
            if (data.grammar_type === "Tipo 2" || data.grammar_type === "Tipo 3") {
                derivationTreeDiv.innerHTML = `<pre>Árbol de Derivación:\n${JSON.stringify(data.derivation_tree, null, 2)}</pre>`;
            } else {
                derivationTreeDiv.textContent = "No aplica: La gramática no es de Tipo 2 o Tipo 3.";
            }
        });
    });
});
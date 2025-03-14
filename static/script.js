let grammarData = {};

// Agregar una nueva fila a la tabla de producciones
document.getElementById('addProductionBtn').addEventListener('click', function() {
    const table = document.getElementById('productionsTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" class="variable-input" placeholder="Ejemplo: S"></td>
        <td>→</td>
        <td><input type="text" class="production-input" placeholder="Ejemplo: AB"></td>
    `;
});

// Generar la gramática
document.getElementById('generateGrammarBtn').addEventListener('click', function() {
    const table = document.getElementById('productionsTable').getElementsByTagName('tbody')[0];
    const startSymbol = document.getElementById('start_symbol').value;

    let variables = new Set();
    let terminals = new Set();
    let grammar = '';

    for (let row of table.rows) {
        const variable = row.cells[0].querySelector('input').value.trim();
        const production = row.cells[2].querySelector('input').value.trim();

        if (variable && production) {
            variables.add(variable);
            grammar += `${variable} → ${production}\n`;

            // terminales
            production.split('').forEach(symbol => {
                if (/[a-z]/.test(symbol)) {
                    terminals.add(symbol);
                }
            });
        }
    }

    // Mostrar la gramática generada
    document.getElementById('generatedGrammar').textContent = 
        `Variables: ${Array.from(variables).join(', ')}\nTerminales: ${Array.from(terminals).join(', ')}\nProducciones:\n${grammar}`;

    // Guardar los datos para usarlos en los botones de evaluar y generar derivaciones
    grammarData = { variables: Array.from(variables), terminals: Array.from(terminals), grammar, startSymbol };
});

// Evaluar la gramática
document.getElementById('evaluateGrammarBtn').addEventListener('click', function() {
    const inputString = document.getElementById('input_string').value;

    fetch('/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            grammar: grammarData.grammar,
            start_symbol: grammarData.startSymbol,
            input_string: inputString
        }),
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('result');
        const grammarTypeDiv = document.getElementById('grammarType');
        
        if (data.result) {
            resultDiv.textContent = 'La cadena pertenece al lenguaje.';
            resultDiv.style.color = 'green';
        } else {
            resultDiv.textContent = 'La cadena NO pertenece al lenguaje.';
            resultDiv.style.color = 'red';
        }
        
        grammarTypeDiv.textContent = 'Tipo de Gramática: ' + data.grammar_type;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Generar derivaciones
document.getElementById('generateDerivationsBtn').addEventListener('click', function() {
    const inputString = document.getElementById('input_string').value;

    fetch('/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            grammar: grammarData.grammar,
            start_symbol: grammarData.startSymbol,
            input_string: inputString
        }),
    })
    .then(response => response.json())
    .then(data => {
        const derivationsDiv = document.getElementById('derivations');
        derivationsDiv.innerHTML = '<strong>Derivaciones:</strong><br>' + data.derivations.join('<br>');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

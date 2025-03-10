let grammarData = {};

document.getElementById('generateGrammarBtn').addEventListener('click', function() {
    const productions = document.getElementById('productions').value;
    const startSymbol = document.getElementById('start_symbol').value;

    // Parsear las producciones
    const { variables, terminals, grammar } = parseProductions(productions);

    // Mostrar la gramática generada
    document.getElementById('generatedGrammar').textContent = 
        `Variables: ${variables.join(', ')}\nTerminales: ${terminals.join(', ')}\nProducciones:\n${grammar}`;

    // Guardar los datos para usarlos en los botones de evaluar y generar derivaciones
    grammarData = { variables, terminals, grammar, startSymbol };
});

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

function parseProductions(productions) {
    const lines = productions.split('\n');
    const variables = new Set();
    const terminals = new Set();
    let grammar = '';

    lines.forEach(line => {
        if (line.includes('→')) {
            const [lhs, rhs] = line.split('→');
            const variable = lhs.trim();
            variables.add(variable);

            rhs.split('|').forEach(prod => {
                prod.trim().split('').forEach(symbol => {
                    if (/[a-z]/.test(symbol)) {
                        terminals.add(symbol);
                    }
                });
            });

            grammar += `${line}\n`;
        }
    });

    return {
        variables: Array.from(variables),
        terminals: Array.from(terminals),
        grammar: grammar.trim(),
    };
}
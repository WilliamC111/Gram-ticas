from flask import Flask, request, jsonify, render_template
from grammar_parser import parse_grammar
from grammar_evaluator import evaluate_string, generate_derivations, check_grammar_type

app = Flask(__name__)

# Ruta para la raíz
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    grammar = data['grammar']
    start_symbol = data['start_symbol']
    input_string = data['input_string']
    
    result = evaluate_string(grammar, start_symbol, input_string)
    derivations = generate_derivations(grammar, start_symbol, input_string)
    grammar_type = check_grammar_type(grammar)
    
    return jsonify({
        'result': result,
        'derivations': derivations,
        'grammar_type': grammar_type
    })

if __name__ == '__main__':
    app.run(debug=True)
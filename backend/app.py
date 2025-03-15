from flask import Flask, request, jsonify, render_template
from grammar_parser import parse_grammar
from grammar_evaluator import evaluate_grammar  # Importar la nueva función
import os

# Configura Flask para usar la carpeta "frontend/static" como carpeta de archivos estáticos
app = Flask(
    __name__,
    template_folder=os.path.abspath('../frontend/templates'),  # Ruta a la carpeta de plantillas
    static_folder=os.path.abspath('../frontend/static')        # Ruta a la carpeta de archivos estáticos
)

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
    
    # Usar la nueva función evaluate_grammar
    result = evaluate_grammar(grammar, start_symbol, input_string)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
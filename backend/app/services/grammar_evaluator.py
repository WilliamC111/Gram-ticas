# grammar_evaluator.py
"""Grammar analysis functions for determining grammar types and evaluating strings."""

from .grammar_parser import parse_grammar
from .grammar_classifiers import is_type_3_grammar, is_type_2_grammar
from .grammar_utils import is_terminal, is_non_terminal
from collections import deque

def check_grammar_type(grammar):
    """Determina el tipo de gramática según la jerarquía de Chomsky."""
    try:
        productions = parse_grammar(grammar)

        if not productions:
            return "Empty grammar or incorrect format"

        is_type_3, _ = is_type_3_grammar(productions)
        if is_type_3:
            return "Tipo 3"

        if is_type_2_grammar(productions):
            return "Tipo 2"

        return "No es tipo 2 ni tipo 3"
    except Exception as e:
        return f"Error analyzing grammar: {str(e)}"

def generate_strings(grammar, start_symbol, max_strings=20, max_length=None):
    """Genera cadenas válidas de la gramática (hasta max_strings) con longitud máxima opcional."""
    try:
        productions = parse_grammar(grammar)
        strings = set()
        
        if not productions:
            return {"result": [], "error": "Empty grammar or incorrect format"}
            
        # Verificar tipo de gramática
        grammar_type = check_grammar_type(grammar)
        if "No es tipo 2 ni tipo 3" in grammar_type:
            return {"result": [], "error": "Solo se pueden generar cadenas para gramáticas tipo 2 o 3"}
            
        # Usamos BFS para generar cadenas
        queue = deque()
        queue.append(([start_symbol], 0))  # (símbolos, pasos)
        
        while queue and len(strings) < max_strings:
            current_symbols, steps = queue.popleft()
            
            # Si ya tenemos solo terminales, agregamos la cadena si cumple con la longitud
            if all(is_terminal(sym) for sym in current_symbols):
                generated_str = ''.join(current_symbols).replace("λ", "")
                if generated_str:  # Ignorar cadena vacía a menos que sea explícita
                    if max_length is None or len(generated_str) <= max_length:
                        strings.add(generated_str)
                continue
                
            # Limitar la profundidad para evitar bucles infinitos
            if steps > 20:
                continue
                
            # Encontrar el primer no terminal
            for i, symbol in enumerate(current_symbols):
                if is_non_terminal(symbol):
                    # Reemplazar con todas las producciones posibles
                    symbol_tuple = tuple([symbol])
                    if symbol_tuple in productions:
                        for production in productions[symbol_tuple]:
                            new_symbols = current_symbols[:i] + list(production) + current_symbols[i+1:]
                            # Si max_length está definido, no seguimos derivaciones que excedan el límite
                            if max_length is None or len(''.join([s for s in new_symbols if is_terminal(s)])) <= max_length:
                                queue.append((new_symbols, steps + 1))
                    break
                    
        return {"result": sorted(strings, key=lambda x: (len(x), x)), "grammar_type": grammar_type}
    except Exception as e:
        return {"result": [], "error": str(e)}
    
def evaluate_grammar(grammar, start_symbol, input_string):
    """Evalúa una gramática y determina si acepta una cadena de entrada."""
    try:
        productions = parse_grammar(grammar)

        if not productions:
            return {
                "result": False,
                "grammar_type": "Empty grammar or incorrect format",
                "error": "No valid productions found",
            }

        # Verificar el símbolo inicial
        start_symbol_tuple = tuple(start_symbol)
        if start_symbol_tuple not in productions:
            return {
                "result": False,
                "grammar_type": check_grammar_type(grammar),
                "error": f"Start symbol '{start_symbol}' does not exist",
            }

        # Si la cadena de entrada está vacía
        if input_string == "":
            for rhs in productions[start_symbol_tuple]:
                if rhs == ["λ"]:
                    return {"result": True, "grammar_type": check_grammar_type(grammar)}
            return {"result": False, "grammar_type": check_grammar_type(grammar)}

        MAX_DERIVATIONS = 1000
        visited = set()
        start_symbol_list = list(start_symbol)
        current_derivations = [(start_symbol_list, input_string)]
        derivation_count = 0

        while current_derivations and derivation_count < MAX_DERIVATIONS:
            derivation_count += 1
            new_derivations = []

            for current_symbols, remaining_input in current_derivations:
                state = (tuple(current_symbols), remaining_input)
                if state in visited:
                    continue
                visited.add(state)

                if not current_symbols and not remaining_input:
                    return {"result": True, "grammar_type": check_grammar_type(grammar)}

                if not current_symbols and remaining_input:
                    continue

                if current_symbols and is_terminal(current_symbols[0]):
                    if remaining_input.startswith(current_symbols[0]):
                        new_derivations.append(
                            (
                                current_symbols[1:],
                                remaining_input[len(current_symbols[0]) :],
                            )
                        )
                    continue

                if current_symbols and current_symbols[0] == "λ":
                    new_derivations.append((current_symbols[1:], remaining_input))
                    continue

                if current_symbols and is_non_terminal(current_symbols[0]):
                    symbol_tuple = tuple([current_symbols[0]])
                    if symbol_tuple in productions:
                        for production in productions[symbol_tuple]:
                            if production == ["λ"]:
                                new_derivations.append(
                                    (current_symbols[1:], remaining_input)
                                )
                            else:
                                new_symbols = production + current_symbols[1:]
                                new_derivations.append((new_symbols, remaining_input))

            current_derivations = new_derivations

        return {"result": False, "grammar_type": check_grammar_type(grammar)}

    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        return {
            "result": False,
            "grammar_type": "Error",
            "error": f"Error: {str(e)}\n{trace}",
        }
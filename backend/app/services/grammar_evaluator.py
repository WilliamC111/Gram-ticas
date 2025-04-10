# grammar_evaluator.py
"""Grammar analysis functions for determining grammar types and evaluating strings."""

from .grammar_parser import parse_grammar
from .grammar_classifiers import is_type_3_grammar, is_type_2_grammar
from .grammar_utils import is_terminal, is_non_terminal
from collections import deque

def check_grammar_type(grammar):
    """Determina el tipo de gramática con prioridad correcta"""
    try:
        productions = parse_grammar(grammar)

        if not productions:
            return "Empty grammar or incorrect format"

        # Primero verificar si es tipo 3
        is_type3, linear_type = is_type_3_grammar(productions)
        if is_type3:
            return f"Tipo 3 ({'lineal derecha' if linear_type == 'right' else 'lineal izquierda'})"

        # Luego verificar tipo 2
        if is_type_2_grammar(productions):
            return "Tipo 2"

        return "No es tipo 2 ni tipo 3"
    except Exception as e:
        return f"Error analyzing grammar: {str(e)}"

def generate_strings(grammar, start_symbol, max_strings=20, max_length=None):
    """Genera cadenas válidas para gramáticas Tipo 2"""
    try:
        productions = parse_grammar(grammar)
        strings = set()
        
        if not productions:
            return {"result": [], "error": "Gramática vacía o formato incorrecto"}
            
        # Usar BFS con manejo especial para λ
        queue = deque()
        queue.append(([start_symbol], 0))  # (símbolos, pasos)
        
        while queue and len(strings) < max_strings:
            current, steps = queue.popleft()
            
            # Generar cadena terminal
            if all(is_terminal(sym) or sym == "λ" for sym in current):
                generated = ''.join(sym for sym in current if sym != "λ")
                if (max_length is None or len(generated) <= max_length) and generated not in strings:
                    strings.add(generated)
                continue
                
            # Limitar recursión
            if steps > 100:  
                break
                
            # Expandir el primer no terminal
            for i, sym in enumerate(current):
                if is_non_terminal(sym):
                    for prod in productions.get((sym,), []):
                        new_current = current[:i] + list(prod) + current[i+1:]
                        # Controlar longitud máxima
                        terminal_count = sum(1 for s in new_current if is_terminal(s))
                        if max_length is None or terminal_count <= max_length:
                            queue.append((new_current, steps + 1))
                    break
                    
        return {
            "result": sorted(strings, key=lambda x: (len(x), x)),
            "grammar_type": check_grammar_type(grammar)
        }
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
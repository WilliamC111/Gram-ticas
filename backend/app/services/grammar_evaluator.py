"""
Grammar analysis functions for determining grammar types and evaluating strings.

Ver docs/grammar_evaluator_docs.py para documentación detallada.
"""

from .grammar_parser import parse_grammar
from .grammar_classifiers import is_type_3_grammar, is_type_2_grammar
from .grammar_utils import is_terminal, is_non_terminal


def check_grammar_type(grammar):
    """
    Determina el tipo de gramática según la jerarquía de Chomsky.
    
    Ver docs/grammar_evaluator_docs.py (CHECK_GRAMMAR_TYPE_DOCS) para documentación detallada.
    
    Args:
        grammar (str): Cadena de texto con la especificación de la gramática
    Returns:
        str: Descripción del tipo de gramática ("Tipo 3", "Tipo 2", etc.)
    """
    try:
        productions = parse_grammar(grammar)

        # If no productions, we can't determine the type
        if not productions:
            return "Empty grammar or incorrect format"

        # First check Type 3 (Regular) as it's more restrictive
        is_type_3, _ = is_type_3_grammar(productions)
        if is_type_3:
            return "Tipo 3"

        # If not Type 3, check Type 2 (Context-Free)
        if is_type_2_grammar(productions):
            return "Tipo 2"

        # If neither Type 2 nor Type 3
        return "No es tipo 2 ni tipo 3"
    except Exception as e:
        return f"Error analyzing grammar: {str(e)}"


def evaluate_grammar(grammar, start_symbol, input_string):
    """
    Evalúa una gramática y determina si acepta una cadena de entrada.
    
    Ver docs/grammar_evaluator_docs.py (EVALUATE_GRAMMAR_DOCS) para documentación detallada.
    
    Args:
        grammar (str): Cadena de texto con la especificación de la gramática
        start_symbol (str): Símbolo inicial de la gramática
        input_string (str): Cadena de entrada a evaluar
    Returns:
        dict: Resultado de la evaluación con campos result, grammar_type y opcionalmente error
    """
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

        # Si la cadena de entrada está vacía, comprobamos si el símbolo inicial puede derivar λ
        if input_string == "":
            # Verificar si puede derivar lambda
            for rhs in productions[start_symbol_tuple]:
                if rhs == ["λ"]:
                    return {"result": True, "grammar_type": check_grammar_type(grammar)}
            return {"result": False, "grammar_type": check_grammar_type(grammar)}

        # Establecer un límite de derivaciones para evitar loops infinitos
        MAX_DERIVATIONS = 1000
        visited = set()

        # Conjunto de derivaciones activas - start_symbol debe ser una lista de caracteres
        start_symbol_list = list(
            start_symbol
        )  # Convertir a lista para manipulación consistente
        current_derivations = [(start_symbol_list, input_string)]
        derivation_count = 0

        while current_derivations and derivation_count < MAX_DERIVATIONS:
            derivation_count += 1
            new_derivations = []

            for current_symbols, remaining_input in current_derivations:
                # Verificar si ya hemos visitado este estado
                state = (tuple(current_symbols), remaining_input)
                if state in visited:
                    continue
                visited.add(state)

                # Caso base: cadena vacía
                if not current_symbols and not remaining_input:
                    return {"result": True, "grammar_type": check_grammar_type(grammar)}

                # Si ya no tenemos símbolos para derivar pero aún queda entrada, esta rama falla
                if not current_symbols and remaining_input:
                    continue

                # Si el primer símbolo es terminal
                if current_symbols and is_terminal(current_symbols[0]):
                    if remaining_input.startswith(current_symbols[0]):
                        new_derivations.append(
                            (
                                current_symbols[1:],
                                remaining_input[len(current_symbols[0]) :],
                            )
                        )
                    continue

                # Si el primer símbolo es lambda (ε)
                if current_symbols and current_symbols[0] == "λ":
                    new_derivations.append((current_symbols[1:], remaining_input))
                    continue

                # Si el primer símbolo es no terminal
                if current_symbols and is_non_terminal(current_symbols[0]):
                    symbol_tuple = tuple([current_symbols[0]])
                    if symbol_tuple in productions:
                        for production in productions[symbol_tuple]:
                            # Si es lambda, simplemente lo omitimos
                            if production == ["λ"]:
                                new_derivations.append(
                                    (current_symbols[1:], remaining_input)
                                )
                            else:
                                # Asegurarnos de que estamos concatenando listas con listas
                                # production ya es una lista, current_symbols[1:] también es una lista
                                new_symbols = production + current_symbols[1:]
                                new_derivations.append((new_symbols, remaining_input))

            # Actualizar derivaciones actuales
            current_derivations = new_derivations

        # Si llegamos aquí, no encontramos una derivación dentro del límite
        return {"result": False, "grammar_type": check_grammar_type(grammar)}

    except Exception as e:
        import traceback

        trace = traceback.format_exc()
        return {
            "result": False,
            "grammar_type": "Error",
            "error": f"Error: {str(e)}\n{trace}",
        }

from .grammar_parser import parse_grammar


# Funciones utilitarias
def is_non_terminal(symbol):
    """Verifica si un símbolo es no terminal (mayúscula)."""
    return isinstance(symbol, str) and symbol.isupper()


def is_terminal(symbol):
    """Verifica si un símbolo es terminal (minúscula o número)."""
    return isinstance(symbol, str) and not symbol.isupper() and symbol != "λ"


def is_lambda(symbol):
    """Verifica si un símbolo es lambda (cadena vacía)."""
    return symbol == "λ"


def is_right_linear_production(rhs):
    """Verifica si una producción es lineal derecha (A → aB o A → a)."""
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_terminal(rhs[0]) and is_non_terminal(rhs[1])
    return False


def is_left_linear_production(rhs):
    """Verifica si una producción es lineal izquierda (A → Ba o A → a)."""
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_non_terminal(rhs[0]) and is_terminal(rhs[1])
    return False


def is_type_3_grammar(productions):
    """
    Valida si una gramática es de Tipo 3 (Regular).
    """
    if not productions:
        return False, None

    # Verificar que cada LHS sea un solo no-terminal
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False, None

    # Determinar si es lineal derecha o izquierda
    linear_type = None  # 'right', 'left' o None

    for lhs, rhs_list in productions.items():
        for rhs in rhs_list:
            # Caso lambda
            if rhs == ["λ"]:
                continue

            # Verificar producciones regulares
            if len(rhs) == 1:
                # A → a (un terminal)
                if not is_terminal(rhs[0]):
                    return False, None
            elif len(rhs) == 2:
                # A → aB (lineal derecha)
                if is_terminal(rhs[0]) and is_non_terminal(rhs[1]):
                    if linear_type == "left":
                        return False, None
                    linear_type = "right"
                # A → Ba (lineal izquierda)
                elif is_non_terminal(rhs[0]) and is_terminal(rhs[1]):
                    if linear_type == "right":
                        return False, None
                    linear_type = "left"
                else:
                    return False, None
            else:
                # Más de 2 símbolos no es regular
                return False, None

    return True, linear_type if linear_type else "right"


def is_type_2_grammar(productions):
    """
    Valida si una gramática es de Tipo 2 (Libre de Contexto).
    """
    if not productions:
        return False

    # En gramáticas de tipo 2, cada lado izquierdo debe ser un solo no-terminal
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False

    return True


def check_grammar_type(grammar):
    """
    Determina el tipo de gramática según la jerarquía de Chomsky.
    """
    try:
        productions = parse_grammar(grammar)

        # Si no hay producciones, no podemos determinar el tipo
        if not productions:
            return "Gramática vacía o formato incorrecto"

        # Primero verificar Tipo 3 (Regular) por ser más restrictivo
        is_type_3, _ = is_type_3_grammar(productions)
        if is_type_3:
            return "Tipo 3"

        # Si no es Tipo 3, verificar Tipo 2 (Libre de Contexto)
        if is_type_2_grammar(productions):
            return "Tipo 2"

        # Si no es ni Tipo 2 ni Tipo 3
        return "No es Tipo 2 ni Tipo 3"
    except Exception as e:
        return f"Error al analizar la gramática: {str(e)}"


def evaluate_grammar(grammar, start_symbol, input_string):
    """
    Evalúa una gramática y determina si acepta una cadena.
    Versión corregida que maneja producciones de cualquier longitud.
    Incluye λ implícito para el símbolo inicial.
    """
    try:
        productions = parse_grammar(grammar)

        if not productions:
            return {
                "result": False,
                "grammar_type": "Gramática vacía o formato incorrecto",
                "error": "No se encontraron producciones válidas",
            }

        # Verificar símbolo inicial
        start_symbol_tuple = tuple(start_symbol)
        if start_symbol_tuple not in productions:
            return {
                "result": False,
                "grammar_type": check_grammar_type(grammar),
                "error": f"Símbolo inicial '{start_symbol}' no existe",
            }

        # Añadir λ implícito al símbolo inicial si no existe
        if ["λ"] not in productions[start_symbol_tuple]:
            productions[start_symbol_tuple].append(["λ"])

        # Nueva implementación de derive
        memo = {}

        def derive(symbols, remaining_str):
            key = (tuple(symbols), remaining_str)
            if key in memo:
                return memo[key]

            # Caso base: ambos vacíos
            if not symbols and not remaining_str:
                return True

            # Manejo de λ
            if symbols and symbols[0] == "λ":
                return derive(symbols[1:], remaining_str)

            # Caso terminal
            if symbols and is_terminal(symbols[0]):
                if remaining_str.startswith(symbols[0]):
                    return derive(symbols[1:], remaining_str[len(symbols[0]) :])
                return False

            # Caso no terminal
            if symbols and is_non_terminal(symbols[0]):
                nt = tuple([symbols[0]])
                if nt not in productions:
                    return False

                for production in productions[nt]:
                    # Probar todas las divisiones posibles de la cadena
                    for split_pos in range(len(remaining_str) + 1):
                        if derive(production + symbols[1:], remaining_str[:split_pos]):
                            if derive([], remaining_str[split_pos:]):
                                memo[key] = True
                                return True
            memo[key] = False
            return False

        result = derive([start_symbol], input_string)
        return {"result": result, "grammar_type": check_grammar_type(grammar)}

    except Exception as e:
        return {"result": False, "grammar_type": "Error", "error": f"Error: {str(e)}"}

from .grammar_parser import parse_grammar


# Funciones utilitarias (asegurar que reciban strings)
def is_non_terminal(symbol):
    """Verifica si un símbolo es no terminal (mayúscula)."""
    return isinstance(symbol, str) and symbol.isupper()


def is_terminal(symbol):
    """Verifica si un símbolo es terminal (minúscula o número)."""
    return isinstance(symbol, str) and not symbol.isupper() and symbol != "λ"


def is_binary_non_terminal_production(production):
    """Verifica si una producción es de la forma A → BC."""
    return (
        len(production) == 2
        and is_non_terminal(production[0])
        and is_non_terminal(production[1])
    )


def is_right_linear_production(production):
    """Verifica si una producción es lineal derecha (A → aB o A → a)."""
    return (
        len(production) == 2
        and is_terminal(production[0])
        and is_non_terminal(production[1])
    ) or (len(production) == 1 and is_terminal(production[0]))


def is_left_linear_production(production):
    """Verifica si una producción es lineal izquierda (A → Ba o A → a)."""
    return (
        len(production) == 2
        and is_non_terminal(production[0])
        and is_terminal(production[1])
    ) or (len(production) == 1 and is_terminal(production[0]))


def can_derive_empty(symbol, productions):
    """Verifica si un símbolo puede derivar en cadena vacía."""
    return symbol in productions and "λ" in productions[symbol]


def check_grammar_type(grammar):
    """Determina el tipo de gramática según la jerarquía de Chomsky."""
    productions = parse_grammar(grammar)

    # Verificar Tipo 3 (Regular)
    is_type_3 = True
    linear_type = None  # 'right', 'left' o None

    for lhs, rhs_list in productions.items():
        # 1. Verificar que LHS sea un solo no-terminal
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            is_type_3 = False
            break

        for rhs in rhs_list:
            # 2. Validar longitud máxima de 2 símbolos
            if len(rhs) > 2:
                is_type_3 = False
                break

            # Caso lambda (A → λ)
            if rhs == ["λ"]:
                continue

            # 3. Producción de 1 símbolo (A → a)
            if len(rhs) == 1:
                if not is_terminal(rhs[0]):
                    is_type_3 = False
                    break

            # 4. Producción de 2 símbolos (A → aB o A → Ba)
            elif len(rhs) == 2:
                # Right-linear (A → aB)
                if is_terminal(rhs[0]) and is_non_terminal(rhs[1]):
                    if linear_type not in (None, "right"):
                        is_type_3 = False
                        break
                    linear_type = "right"

                # Left-linear (A → Ba)
                elif is_non_terminal(rhs[0]) and is_terminal(rhs[1]):
                    if linear_type not in (None, "left"):
                        is_type_3 = False
                        break
                    linear_type = "left"

                else:
                    is_type_3 = False
                    break

        if not is_type_3:
            break

    if is_type_3:
        return "Tipo 3 (Regular)"

    # Verificar Tipo 2 (Libre de Contexto)
    is_type_2 = True
    for lhs, rhs_list in productions.items():
        # 1. Verificar que LHS sea un solo no-terminal
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            is_type_2 = False
            break

        # 2. Verificar que todas las producciones sean válidas para una gramática libre de contexto
        for rhs in rhs_list:
            if not all(is_terminal(s) or is_non_terminal(s) for s in rhs):
                is_type_2 = False
                break

        if not is_type_2:
            break

    if is_type_2:
        return "Tipo 2 (Libre de Contexto)"

    # Si no es de Tipo 3 ni Tipo 2, no se clasifica
    return "No es Tipo 2 ni Tipo 3"

# Función principal
def evaluate_grammar(grammar, start_symbol, input_string):
    """Evalúa una gramática y devuelve si la cadena es aceptada."""
    productions = parse_grammar(grammar)

    def derive(symbol, string):
        # Caso base: cadena vacía
        if not string:
            return symbol in productions and [] in productions[symbol]

        # Si el símbolo tiene producciones
        if symbol in productions:
            for production in productions[symbol]:
                # Verificar si la producción coincide con el inicio de la cadena
                if not production:
                    continue  # Ignorar producciones lambda a menos que la cadena esté vacía

                # Verificar coincidencia símbolo por símbolo
                match = True
                remaining_string = string
                derived_symbols = []

                for s in production:
                    if is_terminal(s):
                        if remaining_string.startswith(s):
                            remaining_string = remaining_string[len(s):]
                            derived_symbols.append(s)
                        else:
                            match = False
                            break
                    else:
                        derived_symbols.append(s)

                if match:
                    # Si no hay símbolos no terminales, verificar si la cadena se consumió completamente
                    if not derived_symbols:
                        return remaining_string == ""

                    # Derivar recursivamente símbolos no terminales
                    current_remaining = remaining_string
                    for i in range(len(derived_symbols)):
                        current_symbol = derived_symbols[i]
                        if is_non_terminal(current_symbol):
                            if derive(current_symbol, current_remaining):
                                return True
                        else:
                            if current_remaining.startswith(current_symbol):
                                current_remaining = current_remaining[len(current_symbol):]
                            else:
                                break
                    else:
                        if current_remaining == "":
                            return True
        return False

    result = derive(start_symbol, input_string)
    grammar_type = check_grammar_type(grammar)

    return {
        "result": result,
        "grammar_type": grammar_type,
    }
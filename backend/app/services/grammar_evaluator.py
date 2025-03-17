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


# Evaluación de cadenas
def evaluate_string(grammar, start_symbol, input_string):
    productions = parse_grammar(grammar)

    def derive(symbol, string):
        if not string:
            return symbol in productions and [] in productions[symbol]

        if symbol in productions:
            for production in productions[symbol]:
                if not production:
                    continue  # Skip lambda unless string is empty

                # Verificar coincidencia símbolo por símbolo
                match = True
                remaining_string = string
                derived_symbols = []

                for s in production:
                    if is_terminal(s):
                        if remaining_string.startswith(s):
                            remaining_string = remaining_string[len(s) :]
                            derived_symbols.append(s)
                        else:
                            match = False
                            break
                    else:
                        derived_symbols.append(s)

                if match:
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
                                current_remaining = current_remaining[
                                    len(current_symbol) :
                                ]
                            else:
                                break
                    else:
                        if current_remaining == "":
                            return True
        return False

    return derive(start_symbol, input_string)


# Generación de derivaciones
def generate_derivations(grammar, start_symbol, input_string):
    """Genera todas las posibles derivaciones para una cadena."""
    productions = parse_grammar(grammar)
    derivations = []

    def derive(symbol, remaining_str, path):
        if not remaining_str:
            if [] in productions.get(symbol, []):  # Verificar producción lambda
                derivations.append(path + [f"{symbol} → λ"])
                return True
            return False

        if symbol not in productions:
            return False

        found = False
        for production in productions[symbol]:
            current_path = path.copy()
            current_remaining = remaining_str
            temp_production = []

            # Convertir producción a string sin espacios para comparación
            prod_str = "".join(production)

            if prod_str and current_remaining.startswith(prod_str):
                # Caso para producciones que coinciden directamente
                new_remaining = current_remaining[len(prod_str) :]
                current_path.append(f"{symbol} → {''.join(production)}")
                if derive(symbol, new_remaining, current_path):
                    found = True
            else:
                # Manejar producciones con no terminales
                valid = True
                temp_remaining = current_remaining
                for idx, p in enumerate(production):
                    if is_terminal(p):
                        if not temp_remaining.startswith(p):
                            valid = False
                            break
                        temp_remaining = temp_remaining[len(p) :]
                    elif is_non_terminal(p):
                        if idx == len(production) - 1:
                            if derive(
                                p,
                                temp_remaining,
                                current_path + [f"{symbol} → {''.join(production)}"],
                            ):
                                found = True
                        else:
                            break  # Lógica más compleja requerida para producciones mixtas

                if valid and not temp_remaining:
                    found = True

        return found

    derive(start_symbol, input_string, [])
    return derivations


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
                # ¡CORRECCIÓN CLAVE! Usar rhs[0] en lugar de rhs
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
        return "Tipo 3"

    # Verificar Tipo 2 (Context-free)
    is_type_2 = all(
        len(lhs) == 1 and is_non_terminal(lhs[0]) for lhs in productions.keys()
    )

    return "Tipo 2" if is_type_2 else "No es Tipo 2 ni Tipo 3"


# Construcción del árbol de derivación
def build_derivation_tree(grammar, start_symbol, input_string):
    """Construye un árbol de derivación para una cadena."""
    productions = parse_grammar(grammar)

    # Memorización para evitar cálculos repetidos
    memo = {}

    def derive_tree(symbol, string):
        # Usar memorización
        memo_key = (symbol, string)
        if memo_key in memo:
            return memo[memo_key]

        # Caso base: cadena vacía
        if not string:
            if can_derive_empty(symbol, productions):
                result = {symbol: "λ"}
                memo[memo_key] = result
                return result
            memo[memo_key] = None
            return None

        # Si el símbolo tiene producciones
        if symbol in productions:
            for production in productions[symbol]:
                # Ignora lambda
                if production == "λ":
                    continue

                # Convertir producción a string para comparación
                prod_str = (
                    "".join(production) if isinstance(production, list) else production
                )

                # Verifica producción directa con terminal
                if (
                    isinstance(production, list)
                    and all(is_terminal(p) for p in production)
                    or (not isinstance(production, list) and is_terminal(production))
                ):
                    if string.startswith(prod_str):
                        remaining = string[len(prod_str) :]

                        if not remaining:  # Si consumimos toda la cadena
                            result = {symbol: prod_str}
                            memo[memo_key] = result
                            return result

                        # Si quedan caracteres, intentamos seguir derivando este mismo símbolo
                        subtree = derive_tree(symbol, remaining)
                        if subtree:
                            result = {symbol: {prod_str: subtree}}
                            memo[memo_key] = result
                            return result

                # Verifica producción con un solo no terminal (A → B)
                if (
                    isinstance(production, list)
                    and len(production) == 1
                    and is_non_terminal(production[0])
                ):
                    subtree = derive_tree(production[0], string)
                    if subtree:
                        result = {symbol: subtree}
                        memo[memo_key] = result
                        return result

                # Verifica producción con dos no terminales (A → BC)
                if isinstance(production, list) and is_binary_non_terminal_production(
                    production
                ):
                    for i in range(len(string) + 1):
                        left_subtree = derive_tree(production[0], string[:i])
                        if left_subtree:
                            right_subtree = derive_tree(production[1], string[i:])
                            if right_subtree:
                                result = {
                                    symbol: {
                                        production[0]: left_subtree,
                                        production[1]: right_subtree,
                                    }
                                }
                                memo[memo_key] = result
                                return result

                # Verifica producción lineal derecha (A → aB)
                if (
                    isinstance(production, list)
                    and len(production) == 2
                    and is_terminal(production[0])
                    and is_non_terminal(production[1])
                ):
                    if string and string[0] == production[0]:
                        subtree = derive_tree(production[1], string[1:])
                        if subtree:
                            result = {symbol: {prod_str: subtree}}
                            memo[memo_key] = result
                            return result

                # Verifica producción lineal izquierda (A → Ba)
                if (
                    isinstance(production, list)
                    and len(production) == 2
                    and is_non_terminal(production[0])
                    and is_terminal(production[1])
                ):
                    if string and string[-1] == production[1]:
                        subtree = derive_tree(production[0], string[:-1])
                        if subtree:
                            result = {symbol: {prod_str: subtree}}
                            memo[memo_key] = result
                            return result

        memo[memo_key] = None
        return None

    return derive_tree(start_symbol, input_string)


# Función principal
def evaluate_grammar(grammar, start_symbol, input_string):
    """Evalúa una gramática y genera información sobre ella."""

    grammar_type = check_grammar_type(grammar)

    # Verifica si la cadena es aceptada
    result = evaluate_string(grammar, start_symbol, input_string)

    # Genera las derivaciones
    derivations = generate_derivations(grammar, start_symbol, input_string)

    # Construye el árbol de derivación si es posible
    derivation_tree = None
    if grammar_type in ["Tipo 2", "Tipo 3"]:
        derivation_tree = build_derivation_tree(grammar, start_symbol, input_string)
        if derivation_tree is None:
            derivation_tree = (
                "No se pudo construir el árbol de derivación para la cadena dada."
            )
    else:
        derivation_tree = "No aplica: La gramática no es de Tipo 2 o Tipo 3."

    # Devuelve los resultados
    return {
        "result": result,
        "derivations": derivations,
        "grammar_type": grammar_type,
        "derivation_tree": derivation_tree,
    }

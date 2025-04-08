"""
Funciones para clasificar producciones gramaticales según la jerarquía de Chomsky.

Ver docs/grammar_classifiers_docs.py para documentación detallada.
"""

from .grammar_utils import is_terminal, is_non_terminal, is_lambda


def is_right_linear_production(rhs):
    """
    Verifica si una producción es lineal a la derecha (A → aB o A → a).

    Ver docs/grammar_classifiers_docs.py (IS_RIGHT_LINEAR_PRODUCTION_DOCS) para documentación detallada.

    Args:
        rhs (list): El lado derecho de la producción como lista de símbolos
    Returns:
        bool: True si la producción es lineal a la derecha, False en caso contrario
    """
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_terminal(rhs[0]) and is_non_terminal(rhs[1])
    return False


def is_left_linear_production(rhs):
    """
    Verifica si una producción es lineal a la izquierda (A → Ba o A → a).

    Ver docs/grammar_classifiers_docs.py (IS_LEFT_LINEAR_PRODUCTION_DOCS) para documentación detallada.

    Args:
        rhs (list): El lado derecho de la producción como lista de símbolos
    Returns:
        bool: True si la producción es lineal a la izquierda, False en caso contrario
    """
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_non_terminal(rhs[0]) and is_terminal(rhs[1])
    return False


def is_type_3_grammar(productions):
    """Verifica si es gramática Tipo 3 (Regular) con chequeo estricto"""
    if not productions:
        return False, None

    has_right = False
    has_left = False
    has_lambda = False

    for lhs, rhs_list in productions.items():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False, None

        for rhs in rhs_list:
            if rhs == ["λ"]:
                if lhs[0] != "S":
                    return False, None
                has_lambda = True
                continue

            if len(rhs) == 1:
                if not is_terminal(rhs[0]):
                    return False, None
            elif len(rhs) == 2:
                if is_terminal(rhs[0]) and is_non_terminal(rhs[1]):
                    has_right = True
                elif is_non_terminal(rhs[0]) and is_terminal(rhs[1]):
                    has_left = True
                else:
                    return False, None
            else:
                return False, None

    # Gramática que puede generar lenguajes no regales no es Tipo 3
    if has_lambda and (has_right or has_left):
        return False, None  # Esto fuerza que sea clasificada como Tipo 2

    if has_right and has_left:
        return False, None

    return (True, "right" if has_right else "left") if (has_right or has_left) else (False, None)


def is_type_2_grammar(productions):
    """Verifica si es gramática Tipo 2 (Libre de Contexto)"""
    if not productions:
        return False

    # Primero verificar que es Tipo 2 básico
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False

    # Solo S → λ permitido
    for lhs, rhs_list in productions.items():
        for rhs in rhs_list:
            if rhs == ["λ"] and lhs[0] != "S":
                return False

    # Ahora, clave: si NO es tipo 3, entonces es tipo 2
    is_type3, _ = is_type_3_grammar(productions)
    return not is_type3



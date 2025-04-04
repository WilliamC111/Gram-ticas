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
    """
    Valida si una gramática es de Tipo 3 (Gramática Regular) según la jerarquía de Chomsky.
    
    Ver docs/grammar_classifiers_docs.py (IS_TYPE_3_GRAMMAR_DOCS) para documentación detallada.
    
    Args:
        productions (dict): Diccionario que mapea tuplas LHS a listas de listas RHS
    Returns:
        tuple: (is_type_3, linear_type) donde is_type_3 es un booleano y linear_type es 'right', 'left' o None
    """
    if not productions:
        return False, None

    # Check that each LHS is a single non-terminal
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False, None

    # Determine if it's right-linear or left-linear
    linear_type = None  # 'right', 'left' or None

    for lhs, rhs_list in productions.items():
        for rhs in rhs_list:
            # Lambda case
            if rhs == ["λ"]:
                continue

            # Check regular productions
            if len(rhs) == 1:
                # A → a (a terminal)
                if not is_terminal(rhs[0]):
                    return False, None
            elif len(rhs) == 2:
                # A → aB (right-linear)
                if is_terminal(rhs[0]) and is_non_terminal(rhs[1]):
                    if linear_type == "left":
                        return False, None
                    linear_type = "right"
                # A → Ba (left-linear)
                elif is_non_terminal(rhs[0]) and is_terminal(rhs[1]):
                    if linear_type == "right":
                        return False, None
                    linear_type = "left"
                else:
                    return False, None
            else:
                # More than 2 symbols is not regular
                return False, None

    return True, linear_type if linear_type else "right"


def is_type_2_grammar(productions):
    """
    Valida si una gramática es de Tipo 2 (Gramática Libre de Contexto) según la jerarquía de Chomsky.
    
    Ver docs/grammar_classifiers_docs.py (IS_TYPE_2_GRAMMAR_DOCS) para documentación detallada.
    
    Args:
        productions (dict): Diccionario que mapea tuplas LHS a listas de listas RHS
    Returns:
        bool: True si la gramática es de Tipo 2, False en caso contrario
    """
    if not productions:
        return False

    # In Type 2 grammars, each left-hand side must be a single non-terminal
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False

    return True

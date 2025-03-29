"""
Functions for classifying grammar productions and determining grammar types
according to the Chomsky hierarchy.
"""

from .grammar_utils import is_terminal, is_non_terminal, is_lambda


def is_right_linear_production(rhs):
    """
    Checks if a production is right-linear (A → aB or A → a).

    Args:
        rhs: The right-hand side of the production (list of symbols)

    Returns:
        bool: True if the production is right-linear, False otherwise
    """
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_terminal(rhs[0]) and is_non_terminal(rhs[1])
    return False


def is_left_linear_production(rhs):
    """
    Checks if a production is left-linear (A → Ba or A → a).

    Args:
        rhs: The right-hand side of the production (list of symbols)

    Returns:
        bool: True if the production is left-linear, False otherwise
    """
    if len(rhs) == 1:
        return is_terminal(rhs[0])
    elif len(rhs) == 2:
        return is_non_terminal(rhs[0]) and is_terminal(rhs[1])
    return False


def is_type_3_grammar(productions):
    """
    Validates if a grammar is Type 3 (Regular).

    A grammar is regular if all productions are of the form:
    - A → a (where a is a terminal)
    - A → aB (right-linear, where a is a terminal and B is a non-terminal)
    - A → Ba (left-linear, where B is a non-terminal and a is a terminal)
    - A → λ (lambda production)

    The grammar must be consistently right-linear or left-linear.

    Args:
        productions: Dictionary mapping LHS tuples to lists of RHS lists

    Returns:
        tuple: (is_type_3, linear_type) where:
            - is_type_3 is a boolean indicating if the grammar is Type 3
            - linear_type is 'right', 'left', or None
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
    Validates if a grammar is Type 2 (Context-Free).

    A grammar is context-free if each left-hand side is a single non-terminal.

    Args:
        productions: Dictionary mapping LHS tuples to lists of RHS lists

    Returns:
        bool: True if the grammar is Type 2, False otherwise
    """
    if not productions:
        return False

    # In Type 2 grammars, each left-hand side must be a single non-terminal
    for lhs in productions.keys():
        if len(lhs) != 1 or not is_non_terminal(lhs[0]):
            return False

    return True

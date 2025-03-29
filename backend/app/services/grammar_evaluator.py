"""
Grammar analysis functions for determining grammar types and evaluating strings.
"""

from .grammar_parser import parse_grammar
from .grammar_classifiers import is_type_3_grammar, is_type_2_grammar
from .grammar_utils import is_terminal, is_non_terminal


def check_grammar_type(grammar):
    """
    Determines the grammar type according to the Chomsky hierarchy.

    Args:
        grammar: Grammar specification string

    Returns:
        str: Grammar type description (Type 3, Type 2, or error message)
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
    Evaluates a grammar and determines if it accepts a string.

    This implementation handles productions of any length and includes
    an implicit λ for the start symbol.

    Args:
        grammar: Grammar specification string
        start_symbol: Start symbol of the grammar
        input_string: Input string to evaluate

    Returns:
        dict: Result dictionary containing:
            - result: Boolean indicating if the grammar accepts the string
            - grammar_type: The type of the grammar
            - error: Error message (if any)
    """
    try:
        productions = parse_grammar(grammar)

        if not productions:
            return {
                "result": False,
                "grammar_type": "Empty grammar or incorrect format",
                "error": "No valid productions found",
            }

        # Check start symbol
        start_symbol_tuple = tuple(start_symbol)
        if start_symbol_tuple not in productions:
            return {
                "result": False,
                "grammar_type": check_grammar_type(grammar),
                "error": f"Start symbol '{start_symbol}' does not exist",
            }

        # Add implicit λ to the start symbol if it doesn't exist
        if ["λ"] not in productions[start_symbol_tuple]:
            productions[start_symbol_tuple].append(["λ"])

        # New derive implementation using memoization
        memo = {}

        def derive(symbols, remaining_str):
            """
            Recursive function to derive a string from a grammar.

            Uses dynamic programming (memoization) to avoid recalculating
            the same sub-problems.

            Args:
                symbols: List of symbols to derive
                remaining_str: Remaining string to match

            Returns:
                bool: True if the string can be derived, False otherwise
            """
            key = (tuple(symbols), remaining_str)
            if key in memo:
                return memo[key]

            # Base case: both empty
            if not symbols and not remaining_str:
                return True

            # Lambda handling
            if symbols and symbols[0] == "λ":
                return derive(symbols[1:], remaining_str)

            # Terminal case
            if symbols and is_terminal(symbols[0]):
                if remaining_str.startswith(symbols[0]):
                    return derive(symbols[1:], remaining_str[len(symbols[0]) :])
                return False

            # Non-terminal case
            if symbols and is_non_terminal(symbols[0]):
                nt = tuple([symbols[0]])
                if nt not in productions:
                    return False

                for production in productions[nt]:
                    # Try all possible string splits
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

"""
Utility functions for grammar symbol classification.
These functions help identify terminal and non-terminal symbols in grammars.
"""


def is_non_terminal(symbol):
    """
    Checks if a symbol is non-terminal (uppercase).

    Args:
        symbol: The symbol to check

    Returns:
        bool: True if the symbol is a non-terminal (uppercase), False otherwise
    """
    return isinstance(symbol, str) and symbol.isupper()


def is_terminal(symbol):
    """
    Checks if a symbol is terminal (lowercase or number, not lambda).

    Args:
        symbol: The symbol to check

    Returns:
        bool: True if the symbol is a terminal, False otherwise
    """
    return isinstance(symbol, str) and not symbol.isupper() and symbol != "λ"


def is_lambda(symbol):
    """
    Checks if a symbol is lambda (empty string).

    Args:
        symbol: The symbol to check

    Returns:
        bool: True if the symbol is lambda, False otherwise
    """
    return symbol == "λ"

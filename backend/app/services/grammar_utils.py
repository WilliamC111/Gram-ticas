"""
Utility functions for grammar symbol classification.

Ver docs/grammar_utils_docs.py para documentación detallada.
"""


def is_non_terminal(symbol):
    """
    Verifica si un símbolo es no terminal (letra mayúscula).
    
    Ver docs/grammar_utils_docs.py (IS_NON_TERMINAL_DOCS) para documentación detallada.
    
    Args:
        symbol (str): El símbolo a verificar
    Returns:
        bool: True si el símbolo es no terminal, False en caso contrario
    """
    return isinstance(symbol, str) and symbol.isupper()


def is_terminal(symbol):
    """
    Verifica si un símbolo es terminal (letra minúscula o número, no lambda).
    
    Ver docs/grammar_utils_docs.py (IS_TERMINAL_DOCS) para documentación detallada.
    
    Args:
        symbol (str): El símbolo a verificar
    Returns:
        bool: True si el símbolo es terminal, False en caso contrario
    """
    return isinstance(symbol, str) and not symbol.isupper() and symbol != "λ"


def is_lambda(symbol):
    """
    Verifica si un símbolo representa lambda (la cadena vacía).
    
    Ver docs/grammar_utils_docs.py (IS_LAMBDA_DOCS) para documentación detallada.
    
    Args:
        symbol (str): El símbolo a verificar
    Returns:
        bool: True si el símbolo es lambda, False en caso contrario
    """
    return symbol == "λ"

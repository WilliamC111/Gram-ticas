"""
Documentación detallada para el módulo grammar_utils.
"""

MODULE_DESCRIPTION = """
Este módulo proporciona funciones utilitarias para la clasificación de símbolos gramaticales,
permitiendo identificar si un símbolo es terminal, no terminal o representa una cadena vacía (lambda).
Estas funciones son utilizadas como bloques básicos por los otros módulos que implementan
la clasificación de gramáticas y la evaluación de cadenas.
"""

IS_NON_TERMINAL_DOCS = """
En la notación estándar de gramáticas formales, los símbolos no terminales
se representan convencionalmente con letras mayúsculas. Estos símbolos son
variables de la gramática que pueden ser sustituidas por otras cadenas
de símbolos terminales y no terminales según las reglas de producción.

Args:
    symbol (str): El símbolo a verificar

Returns:
    bool: True si el símbolo es no terminal (mayúscula), False en caso contrario

Ejemplos:
    >>> is_non_terminal('A')
    True
    >>> is_non_terminal('a')
    False
    >>> is_non_terminal('1')
    False
"""

IS_TERMINAL_DOCS = """
En la notación estándar de gramáticas formales, los símbolos terminales representan
los elementos básicos del lenguaje que no pueden ser sustituidos. Son los caracteres
o tokens que aparecen en las cadenas generadas por la gramática.

En esta implementación, cualquier símbolo que no esté en mayúsculas y no sea lambda
se considera un terminal.

Args:
    symbol (str): El símbolo a verificar

Returns:
    bool: True si el símbolo es terminal, False en caso contrario

Ejemplos:
    >>> is_terminal('a')
    True
    >>> is_terminal('1')
    True
    >>> is_terminal('A')
    False
    >>> is_terminal('λ')
    False
"""

IS_LAMBDA_DOCS = """
Lambda (λ) es un símbolo especial en teoría de lenguajes formales que representa
la cadena vacía (epsilon). En las producciones, lambda permite generar reglas
que eliminan símbolos o generan la cadena vacía.

Esta función identifica si un símbolo es el carácter lambda (λ), utilizado para
representar el concepto de cadena vacía en las producciones gramaticales.

Args:
    symbol (str): El símbolo a verificar

Returns:
    bool: True si el símbolo es lambda (λ), False en caso contrario

Ejemplos:
    >>> is_lambda('λ')
    True
    >>> is_lambda('a')
    False
"""

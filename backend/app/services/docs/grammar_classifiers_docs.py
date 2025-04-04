"""
Documentación detallada para el módulo grammar_classifiers.
"""

MODULE_DESCRIPTION = """
Este módulo contiene funciones para analizar y clasificar producciones gramaticales
según la jerarquía de Chomsky, permitiendo determinar si una gramática pertenece
al Tipo 3 (Regular), Tipo 2 (Libre de Contexto), o ninguno de estos dos tipos.
Estas clasificaciones son fundamentales en la teoría de lenguajes formales y
tienen importantes implicaciones teóricas y prácticas.
"""

IS_RIGHT_LINEAR_PRODUCTION_DOCS = """
Una producción es lineal a la derecha si:
1. Consiste en un único símbolo terminal (A → a), o
2. Consiste en un símbolo terminal seguido por un no terminal (A → aB)

Las gramáticas lineales a la derecha son un subconjunto de las gramáticas regulares (Tipo 3)
y pueden ser implementadas directamente como autómatas finitos deterministas.

Args:
    rhs (list): El lado derecho de la producción como lista de símbolos

Returns:
    bool: True si la producción es lineal a la derecha, False en caso contrario

Ejemplos:
    >>> is_right_linear_production(['a', 'B'])
    True
    >>> is_right_linear_production(['a'])
    True
    >>> is_right_linear_production(['A', 'b'])
    False
"""

IS_LEFT_LINEAR_PRODUCTION_DOCS = """
Una producción es lineal a la izquierda si:
1. Consiste en un único símbolo terminal (A → a), o
2. Consiste en un símbolo no terminal seguido por un terminal (A → Ba)

Las gramáticas lineales a la izquierda son un subconjunto de las gramáticas regulares (Tipo 3)
y también pueden implementarse como autómatas finitos, aunque requieren una representación
diferente a las lineales a la derecha.

Args:
    rhs (list): El lado derecho de la producción como lista de símbolos

Returns:
    bool: True si la producción es lineal a la izquierda, False en caso contrario

Ejemplos:
    >>> is_left_linear_production(['B', 'a'])
    True
    >>> is_left_linear_production(['a'])
    True
    >>> is_left_linear_production(['a', 'B'])
    False
"""

IS_TYPE_3_GRAMMAR_DOCS = """
Una gramática es regular (Tipo 3) si todas sus producciones tienen alguna de estas formas:
- A → a (donde 'a' es un terminal)
- A → aB (lineal a la derecha, donde 'a' es terminal y 'B' es no terminal)
- A → Ba (lineal a la izquierda, donde 'B' es no terminal y 'a' es terminal)
- A → λ (producción lambda/vacía)

Adicionalmente, la gramática debe ser consistentemente lineal a la derecha o a la izquierda,
no puede mezclar ambos tipos de producciones.

Las gramáticas regulares tienen equivalencia directa con los autómatas finitos y son las
más restrictivas de la jerarquía de Chomsky, reconociendo solo lenguajes regulares.

Args:
    productions (dict): Diccionario que mapea tuplas LHS a listas de listas RHS.
                       Ejemplo: {('S',): [['a', 'B'], ['b']], ('B',): [['b']]}

Returns:
    tuple: Una tupla (is_type_3, linear_type) donde:
        - is_type_3 (bool): Indica si la gramática es de Tipo 3
        - linear_type (str): 'right', 'left', o None (por defecto 'right' si no se determina)

Notas:
    - Si la gramática está vacía, retorna (False, None)
    - Si alguna producción no sigue las reglas del Tipo 3, retorna (False, None)
    - Si mezcla producciones lineales a la izquierda y derecha, retorna (False, None)
"""

IS_TYPE_2_GRAMMAR_DOCS = """
Una gramática es libre de contexto (Tipo 2) si cada lado izquierdo de sus producciones
contiene exactamente un símbolo no terminal. Es decir, todas las producciones tienen la forma:
A → α
donde A es un único símbolo no terminal y α es una cadena arbitraria de terminales y no terminales.

Las gramáticas libres de contexto pueden generar lenguajes más complejos que las regulares y
tienen equivalencia con los autómatas de pila. Son fundamentales para la descripción de
lenguajes de programación y parsing sintáctico.

Args:
    productions (dict): Diccionario que mapea tuplas LHS a listas de listas RHS.
                       Ejemplo: {('S',): [['a', 'S', 'b'], ['a', 'b']], ('A',): [['c']]}

Returns:
    bool: True si la gramática es de Tipo 2 (libre de contexto), False en caso contrario

Notas:
    - Si la gramática está vacía, retorna False
    - Una gramática de Tipo 3 (regular) es también de Tipo 2 (libre de contexto)
    - Esta función solo verifica la restricción sobre el lado izquierdo, no otras
      propiedades o restricciones adicionales
"""

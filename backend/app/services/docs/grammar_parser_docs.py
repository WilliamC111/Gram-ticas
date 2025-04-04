"""
Documentación detallada para el módulo grammar_parser.
"""

MODULE_DESCRIPTION = """
Este módulo contiene funciones para analizar y procesar gramáticas formales especificadas
en notación matemática estándar, transformando el texto ingresado en estructuras de datos
que pueden ser manipuladas por los algoritmos de clasificación y evaluación.
"""

PARSE_GRAMMAR_DOCS = """
Analiza y procesa una gramática formal especificada en notación matemática estándar,
transformándola en una estructura de datos que representa sus producciones.

La función soporta el formato típico utilizado en teoría de lenguajes formales:
T = (a, b)
N = (S, B, A)
S = S
P = {
    S → a B
    B → b
    ...
}

También admite un formato alternativo más simple donde las producciones
se especifican directamente sin la estructura formal completa.

Args:
    grammar_text (str): Representación textual de la gramática formal

Returns:
    dict: Diccionario donde las claves son los lados izquierdos (LHS) como tuplas de símbolos
          y los valores son listas de lados derechos (RHS) como listas de símbolos.
          Por ejemplo: {('S',): [['a', 'B'], ['b']], ('B',): [['b'], ['λ']]}
          
Notas:
    - Los símbolos terminales se representan como caracteres en minúscula
    - Los símbolos no terminales se representan como caracteres en mayúscula
    - Lambda (cadena vacía) se representa como 'λ'
"""

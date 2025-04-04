"""
Documentación detallada para el módulo grammar_evaluator.
"""

MODULE_DESCRIPTION = """
Este módulo proporciona funciones para el análisis de gramáticas formales, permitiendo
determinar su tipo según la jerarquía de Chomsky y evaluar si una determinada cadena
de entrada puede ser generada por la gramática. Implementa algoritmos de derivación
y clasificación para gramáticas regulares (Tipo 3) y libres de contexto (Tipo 2).
"""

CHECK_GRAMMAR_TYPE_DOCS = """
Esta función analiza una gramática formal especificada como texto y determina
si pertenece al Tipo 3 (Regular) o al Tipo 2 (Libre de Contexto). El análisis
se realiza examinando las producciones de la gramática y verificando si cumplen
con las restricciones de cada tipo.

La función primero comprueba si la gramática es de Tipo 3 (más restrictiva),
y si no lo es, comprueba si es de Tipo 2. Si no encaja en ninguna de estas
categorías, se clasifica como "No es tipo 2 ni tipo 3".

Args:
    grammar (str): Cadena de texto con la especificación de la gramática

Returns:
    str: Descripción del tipo de gramática: "Tipo 3", "Tipo 2", 
         "No es tipo 2 ni tipo 3", o mensaje de error

Excepciones:
    Se captura cualquier excepción durante el proceso y se devuelve
    un mensaje de error descriptivo.
"""

EVALUATE_GRAMMAR_DOCS = """
Esta función implementa un algoritmo de derivación para determinar si una gramática
formal puede generar una cadena de entrada dada. Utiliza un enfoque de búsqueda
en amplitud con limitación estricta de profundidad para evitar la recursión infinita
que puede ocurrir con ciertas gramáticas.

El algoritmo funciona manteniendo un conjunto de derivaciones activas y expandiendo
cada una según las producciones de la gramática. Para cada derivación, intenta hacer
coincidir símbolos terminales con la cadena de entrada y sustituir no terminales
utilizando las producciones de la gramática.

Args:
    grammar (str): Cadena de texto con la especificación de la gramática
    start_symbol (str): Símbolo inicial de la gramática
    input_string (str): Cadena de entrada a evaluar
    
Returns:
    dict: Un diccionario con los siguientes campos:
        - result (bool): True si la cadena es aceptada, False en caso contrario
        - grammar_type (str): El tipo de gramática según la jerarquía de Chomsky
        - error (str, opcional): Mensaje de error si ocurrió alguno

Notas:
    - Se establece un límite máximo de derivaciones (1000) para evitar bucles infinitos
    - Se utiliza un conjunto de estados visitados para evitar repetir cálculos
    - La función maneja correctamente cadenas vacías (epsilon/lambda)
    - Si ocurre un error durante la evaluación, se devuelve el rastreo completo
"""

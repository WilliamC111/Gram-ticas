def parse_grammar(grammar_text):
    """
    Parsea una gramática en el formato:
    T = (a, b)
    N = (S, B, A)
    S = S
    P = {
        S → a B
        ...
    }

    Returns:
        dict: Diccionario donde las claves son LHS (tupla de símbolos)
              y los valores son listas de RHS (listas de símbolos)
    """
    grammar_text = grammar_text.strip()
    lines = grammar_text.split("\n")

    # Diccionario para almacenar las producciones
    productions = {}

    # Buscar la sección de producciones
    in_production_section = False
    for line in lines:
        line = line.strip()

        # Detectar inicio de sección de producciones
        if "P = {" in line:
            in_production_section = True
            continue

        # Detectar fin de sección de producciones
        if in_production_section and "}" in line:
            break

        # Procesar línea de producción
        if in_production_section and "→" in line:
            # Extraer LHS y RHS
            parts = line.split("→", 1)
            if len(parts) == 2:
                lhs = parts[0].strip()
                rhs = parts[1].strip()

                # Convertir LHS a tupla de símbolos
                lhs_tuple = tuple(lhs)

                # Inicializar entrada para este LHS si no existe
                if lhs_tuple not in productions:
                    productions[lhs_tuple] = []

                # Manejar lambda (cadena vacía)
                if rhs == "λ" or rhs == "epsilon" or rhs == "":
                    productions[lhs_tuple].append(["λ"])
                else:
                    # Dividir RHS en símbolos (asumiendo un símbolo por carácter)
                    # Pero manejar casos como "a B" donde hay espacios
                    rhs_symbols = []
                    tokens = rhs.split()
                    for token in tokens:
                        rhs_symbols.extend(list(token))

                    productions[lhs_tuple].append(rhs_symbols)

    # Si no se encontraron producciones, intentar un formato alternativo
    if not productions:
        for line in lines:
            line = line.strip()
            if "→" in line:
                parts = line.split("→", 1)
                if len(parts) == 2:
                    lhs = parts[0].strip()
                    rhs = parts[1].strip()

                    lhs_tuple = tuple(lhs)
                    if lhs_tuple not in productions:
                        productions[lhs_tuple] = []

                    if rhs == "λ" or rhs == "epsilon" or rhs == "":
                        productions[lhs_tuple].append(["λ"])
                    else:
                        rhs_symbols = []
                        tokens = rhs.split()
                        for token in tokens:
                            rhs_symbols.extend(list(token))

                        productions[lhs_tuple].append(rhs_symbols)

    return productions

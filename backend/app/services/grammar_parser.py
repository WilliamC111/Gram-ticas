"""
Grammar parsing module for processing grammar specifications in formal notation.

Ver docs/grammar_parser_docs.py para documentación detallada.
"""


def parse_grammar(grammar_text):
    """
    Analiza y procesa una gramática formal especificada en notación matemática estándar.
    
    Ver docs/grammar_parser_docs.py (PARSE_GRAMMAR_DOCS) para documentación detallada.
    
    Args:
        grammar_text (str): Representación textual de la gramática formal
    Returns:
        dict: Diccionario de producciones donde LHS son tuplas y RHS son listas de listas
    """
    grammar_text = grammar_text.strip()
    lines = grammar_text.split("\n")

    # Dictionary to store productions
    productions = {}

    # Look for the productions section
    in_production_section = False
    for line in lines:
        line = line.strip()

        # Detect start of productions section
        if "P = {" in line:
            in_production_section = True
            continue

        # Detect end of productions section
        if in_production_section and "}" in line:
            break

        # Process production line
        if in_production_section and "→" in line:
            # Extract LHS and RHS
            parts = line.split("→", 1)
            if len(parts) == 2:
                lhs = parts[0].strip()
                rhs = parts[1].strip()

                # Convert LHS to tuple of symbols
                lhs_tuple = tuple(lhs)

                # Initialize entry for this LHS if it doesn't exist
                if lhs_tuple not in productions:
                    productions[lhs_tuple] = []

                # Handle lambda (empty string)
                if rhs == "λ" or rhs == "epsilon" or rhs == "":
                    productions[lhs_tuple].append(["λ"])
                else:
                    # Split RHS into symbols (assuming one symbol per character)
                    # But handle cases like "a B" where there are spaces
                    rhs_symbols = []
                    tokens = rhs.split()
                    for token in tokens:
                        rhs_symbols.extend(list(token))

                    productions[lhs_tuple].append(rhs_symbols)

    # If no productions were found, try an alternative format
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

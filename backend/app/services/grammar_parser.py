"""
Grammar parsing module for processing grammar specifications in formal notation.
"""


def parse_grammar(grammar_text):
    """
    Parses a grammar in the format:
    T = (a, b)
    N = (S, B, A)
    S = S
    P = {
        S → a B
        ...
    }

    Args:
        grammar_text (str): Text representation of the grammar

    Returns:
        dict: Dictionary where keys are LHS (tuple of symbols)
              and values are lists of RHS (lists of symbols)
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

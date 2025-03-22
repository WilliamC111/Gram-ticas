def parse_grammar(grammar_text):
    """Parsea el texto de la gramática en formato T, N, S, P."""
    productions = {}
    lines = [line.strip() for line in grammar_text.split("\n") if line.strip()]

    # Extraer secciones relevantes
    t_section = next(
        line.split("=")[1].strip() for line in lines if line.startswith("T =")
    )
    n_section = next(
        line.split("=")[1].strip() for line in lines if line.startswith("N =")
    )
    s_section = next(
        line.split("=")[1].strip() for line in lines if line.startswith("S =")
    )

    # Procesar producciones (P = { ... })
    in_p = False
    for line in lines:
        if line.startswith("P = {"):
            in_p = True
            continue
        if line == "}" and in_p:
            in_p = False
            break
        if in_p and "→" in line:
            # Dividir lhs y rhs
            lhs, rhs = line.split("→", 1)
            lhs = lhs.strip()
            rhs = rhs.strip()

            # Manejar lambda (λ)
            if rhs == "λ":
                if lhs not in productions:
                    productions[lhs] = []
                productions[lhs].append([])  # Producción lambda
                continue

            # Dividir símbolos del rhs
            symbols = []
            current = ""
            for char in rhs:
                if char == " ":
                    if current:
                        symbols.append(current)
                        current = ""
                else:
                    current += char
            if current:
                symbols.append(current)

            # Agregar a producciones
            if lhs not in productions:
                productions[lhs] = []
            productions[lhs].append(symbols)

    return productions
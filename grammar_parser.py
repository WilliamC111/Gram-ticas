def parse_grammar(grammar):
    # Parsear la gramática ingresada por el usuario
    productions = {}
    for production in grammar.split('\n'):
        if '→' in production:
            lhs, rhs = production.split('→')
            lhs = lhs.strip()
            rhs = [r.strip() for r in rhs.split('|')]
            productions[lhs] = rhs
    return productions
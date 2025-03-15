def parse_grammar(grammar):
    productions = {}
    for production in grammar.split('\n'):
        if '→' in production:
            lhs, rhs = production.split('→')
            lhs = lhs.strip()
            # Dividir las producciones por "|" y eliminar espacios
            rhs_list = [r.strip() for r in rhs.split('|')]
            # Si el lado derecho está vacío, asumimos que es λ
            if not rhs_list or all(r == '' for r in rhs_list):
                rhs_list = ['λ']
            productions[lhs] = rhs_list
    return productions
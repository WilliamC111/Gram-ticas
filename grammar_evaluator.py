from grammar_parser import parse_grammar

def evaluate_string(grammar, start_symbol, input_string):
    # Evaluar si la cadena pertenece al lenguaje generado por la gramática
    productions = parse_grammar(grammar)
    
    def derive(symbol, string):
        if not string:
            return symbol in productions and 'λ' in productions[symbol]
        if symbol in productions:
            for production in productions[symbol]:
                if len(production) == 1 and production[0] == string[0]:
                    if derive(production[0], string[1:]):
                        return True
                elif len(production) == 2 and production[0] == string[0]:
                    if derive(production[1], string[1:]):
                        return True
        return False
    
    return derive(start_symbol, input_string)

def generate_derivations(grammar, start_symbol, input_string):
    # Generar las derivaciones para la cadena
    productions = parse_grammar(grammar)
    derivations = []
    
    def derive(symbol, string, path):
        if not string:
            if symbol in productions and 'λ' in productions[symbol]:
                derivations.append(path + [f"{symbol} → λ"])
            return
        if symbol in productions:
            for production in productions[symbol]:
                if len(production) == 1 and production[0] == string[0]:
                    derive(production[0], string[1:], path + [f"{symbol} → {production[0]}"])
                elif len(production) == 2 and production[0] == string[0]:
                    derive(production[1], string[1:], path + [f"{symbol} → {production[0]}{production[1]}"])
    
    derive(start_symbol, input_string, [])
    return derivations

def check_grammar_type(grammar):
    # Verificar si la gramática es de tipo 2 o 3
    productions = parse_grammar(grammar)
    is_type_3 = True
    for lhs, rhs_list in productions.items():
        for rhs in rhs_list:
            if len(rhs) > 2 or (len(rhs) == 2 and not (rhs[0].isupper() and rhs[1].islower())):
                is_type_3 = False
                break
        if not is_type_3:
            break
    return "Tipo 3" if is_type_3 else "Tipo 2"
from grammar_parser import parse_grammar

def evaluate_string(grammar, start_symbol, input_string):
    productions = parse_grammar(grammar)
    
    def derive(symbol, string):
        # Si la cadena está vacía, verificamos si el símbolo puede derivar en λ
        if not string:
            return symbol in productions and 'λ' in productions[symbol]
        
        # Si el símbolo tiene producciones
        if symbol in productions:
            for production in productions[symbol]:
                # Si la producción es λ, la ignoramos (ya se maneja arriba)
                if production == 'λ':
                    continue
                
                # Si la producción coincide con el primer carácter de la cadena
                if string.startswith(production):
                    if derive(symbol, string[len(production):]):
                        return True
                
                # Si la producción es de la forma A → BC
                if len(production) == 2 and production[0].isupper() and production[1].isupper():
                    # Dividimos la cadena en dos partes y derivamos recursivamente
                    for i in range(1, len(string)):
                        if derive(production[0], string[:i]) and derive(production[1], string[i:]):
                            return True
        return False
    
    return derive(start_symbol, input_string)

def generate_derivations(grammar, start_symbol, input_string):
    productions = parse_grammar(grammar)
    derivations = []
    
    def derive(symbol, string, path):
        if not string:
            if symbol in productions and 'λ' in productions[symbol]:
                derivations.append(path + [f"{symbol} → λ"])
            return
        if symbol in productions:
            for production in productions[symbol]:
                if string.startswith(production):
                    derive(symbol, string[len(production):], path + [f"{symbol} → {production}"])
                elif len(production) == 2 and production[0].isupper() and production[1].isupper():
                    for i in range(1, len(string)):
                        if derive(production[0], string[:i], path + [f"{symbol} → {production}"]) and derive(production[1], string[i:], path + [f"{symbol} → {production}"]):
                            derivations.append(path + [f"{symbol} → {production}"])
    
    derive(start_symbol, input_string, [])
    return derivations

def check_grammar_type(grammar):
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

def build_derivation_tree(grammar, start_symbol, input_string):
    productions = parse_grammar(grammar)
    tree = {}

    def derive(symbol, string):
        if not string:
            # Si la cadena está vacía, verificamos si el símbolo puede derivar en λ
            if symbol in productions and 'λ' in productions[symbol]:
                return {symbol: 'λ'}
            return None
        
        if symbol in productions:
            for production in productions[symbol]:
                # Si la producción es λ, la ignoramos (ya se maneja arriba)
                if production == 'λ':
                    continue
                
                # Si la producción coincide con el primer carácter de la cadena
                if string.startswith(production):
                    subtree = derive(symbol, string[len(production):])
                    if subtree:
                        return {symbol: {production: subtree}}
                
                # Si la producción es de la forma A → aB (Tipo 3, lineal derecha)
                if len(production) == 2 and production[0].islower() and production[1].isupper():
                    if string[0] == production[0]:  # Verificar si el primer carácter coincide
                        subtree = derive(production[1], string[1:])  # Derivar el resto de la cadena
                        if subtree:
                            return {symbol: {production: subtree}}
                
                # Si la producción es de la forma A → Ba (Tipo 3, lineal izquierda)
                if len(production) == 2 and production[0].isupper() and production[1].islower():
                    if string[-1] == production[1]:  # Verificar si el último carácter coincide
                        subtree = derive(production[0], string[:-1])  # Derivar el resto de la cadena
                        if subtree:
                            return {symbol: {production: subtree}}
        return None
    
    return derive(start_symbol, input_string)

def evaluate_grammar(grammar, start_symbol, input_string):
    grammar_type = check_grammar_type(grammar)
    result = evaluate_string(grammar, start_symbol, input_string)
    derivations = generate_derivations(grammar, start_symbol, input_string)
    derivation_tree = None

    if grammar_type in ["Tipo 2", "Tipo 3"]:
        derivation_tree = build_derivation_tree(grammar, start_symbol, input_string)
        if derivation_tree is None:
            derivation_tree = "No se pudo construir el árbol de derivación para la cadena dada."
    else:
        derivation_tree = "No aplica: La gramática no es de Tipo 2 o Tipo 3."

    return {
        "result": result,
        "derivations": derivations,
        "grammar_type": grammar_type,
        "derivation_tree": derivation_tree
    }
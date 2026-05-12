import json
import re

filepath = r'c:\Users\pc\Desktop\Psc english\data\articles.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def generate_eo(q, o, a, e):
    eo = []
    is_standard = any(opt.lower() in ['a', 'an', 'the', 'no article', 'some'] for opt in o)
    is_sentences = q.startswith("Choose the sentence")
    is_error_spotting = q.startswith("Find the article error")
    
    for idx, opt in enumerate(o):
        if idx == a:
            eo.append(f"Correct: {e}")
            continue
            
        opt_lower = opt.lower().strip()
        
        if is_error_spotting:
            if opt_lower == "no error":
                eo.append("Incorrect. The sentence contains an article error.")
            else:
                eo.append("This part of the sentence is grammatically correct.")
        elif is_sentences:
            eo.append(f"Incorrect sentence structure. Rule: {e}")
        elif is_standard:
            if opt_lower == 'a':
                eo.append("Incorrect. 'A' is used before consonant sounds.")
            elif opt_lower == 'an':
                eo.append("Incorrect. 'An' is used before vowel sounds.")
            elif opt_lower == 'the':
                eo.append("Incorrect. 'The' is used for specific, definite, or unique nouns.")
            elif opt_lower == 'no article':
                eo.append("Incorrect. The context requires an article to modify the noun.")
            elif opt_lower == 'some':
                eo.append("Incorrect. 'Some' is typically used for uncountable or plural nouns.")
            else:
                eo.append(f"Incorrect option. Rule: {e}")
        else:
            eo.append(f"Incorrect. Rule: {e}")
            
    return json.dumps(eo)

def parse_obj(line):
    q_m = re.search(r'q\s*:\s*"(.*?)"', line)
    o_m = re.search(r'o\s*:\s*(\[.*?\])', line)
    a_m = re.search(r'a\s*:\s*(\d+)', line)
    e_m = re.search(r'e\s*:\s*"(.*?)"', line)
    
    if not (q_m and o_m and a_m and e_m): return None
    
    q = q_m.group(1)
    a = int(a_m.group(1))
    e = e_m.group(1)
    
    import ast
    try:
        o = ast.literal_eval(o_m.group(1))
    except:
        return None
        
    return q, o, a, e

lines = content.split('\n')
updated = 0
for i in range(len(lines)):
    line = lines[i]
    if line.strip().startswith('{') and 'q:' in line:
        parsed = parse_obj(line)
        if parsed:
            q, o, a, e = parsed
            eo_str = generate_eo(q, o, a, e)
            
            new_line = line.rstrip()
            if new_line.endswith('},'):
                new_line = new_line[:-2] + f',eo:{eo_str}' + '},'
            elif new_line.endswith('}'):
                new_line = new_line[:-1] + f',eo:{eo_str}' + '}'
                
            lines[i] = new_line
            updated += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
    
print(f"Successfully updated {updated} questions in articles.js with 'eo' specific explanations.")

import json
import re

filepath = r'c:\Users\pc\Desktop\Psc english\data\tenses.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def generate_eo(q, o, a, e):
    eo = []
    
    for idx, opt in enumerate(o):
        if idx == a:
            eo.append(f"Correct: {e}")
        else:
            opt_lower = opt.lower().strip()
            if opt_lower in ['when', 'than', 'before', 'then', 'would', 'shall', 'will', 'will have']:
                eo.append(f"Incorrect. '{opt}' does not complete the structure correctly. Rule: {e}")
            else:
                eo.append(f"Incorrect verb form/tense. '{opt}' does not fit the timeline here. Rule: {e}")
            
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
            
            if ',eo:' in line:
                 line = re.sub(r',eo:\s*\[.*?\]', f',eo:{eo_str}', line)
                 new_line = line
            else:
                new_line = line.rstrip()
                if new_line.endswith('},'):
                    new_line = new_line[:-2] + f',eo:{eo_str}' + '},'
                elif new_line.endswith('}'):
                    new_line = new_line[:-1] + f',eo:{eo_str}' + '}'
                
            lines[i] = new_line
            updated += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
    
print(f"Successfully updated {updated} questions in tenses.js with 'eo' specific explanations.")

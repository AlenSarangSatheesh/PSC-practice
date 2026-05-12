import json
import re
import os
import glob

data_dir = r'c:\Users\pc\Desktop\Psc english\data'
files = glob.glob(os.path.join(data_dir, '*.js'))

def generate_eo(q, o, a, e, topic):
    eo = []
    
    for idx, opt in enumerate(o):
        if idx == a:
            eo.append(f"Correct: {e}")
        else:
            opt_lower = opt.lower().strip()
            
            # Contextual hints based on topic
            if topic in ['synonyms_antonyms', 'one_word_substitutions', 'idioms_phrases', 'phrasal_verbs', 'confusing_words']:
                eo.append(f"Incorrect. '{opt}' does not match the required meaning. Rule: {e}")
            elif topic == 'spelling':
                eo.append(f"Incorrect. '{opt}' is a misspelled variation. Rule: {e}")
            elif topic == 'subject_verb_agreement':
                eo.append(f"Incorrect verb form. '{opt}' fails to agree with the subject. Rule: {e}")
            elif topic == 'question_tags':
                eo.append(f"Incorrect tag. '{opt}' does not match the statement's polarity or auxiliary verb. Rule: {e}")
            elif topic in ['voice_change', 'reported_speech']:
                eo.append(f"Incorrect structure. '{opt}' violates the conversion rules. Rule: {e}")
            elif topic == 'prepositions':
                 if "takes" in e.lower() or "=" in e.lower() or opt_lower in e.lower():
                     eo.append(f"Incorrect. '{opt}' does not fit this context. Remember: {e}")
                 else:
                     eo.append(f"Incorrect preposition. '{opt}' is not used here. Rule: {e}")
            elif topic == 'articles':
                 if opt_lower == 'a': eo.append("Incorrect. 'A' is used before consonant sounds.")
                 elif opt_lower == 'an': eo.append("Incorrect. 'An' is used before vowel sounds.")
                 elif opt_lower == 'the': eo.append("Incorrect. 'The' is used for specific, definite, or unique nouns.")
                 elif opt_lower == 'no article': eo.append("Incorrect. The context requires an article to modify the noun.")
                 elif opt_lower == 'some': eo.append("Incorrect. 'Some' is typically used for uncountable or plural nouns.")
                 else: eo.append(f"Incorrect option. Rule: {e}")
            elif topic == 'tenses':
                 if opt_lower in ['when', 'than', 'before', 'then', 'would', 'shall', 'will', 'will have']:
                     eo.append(f"Incorrect. '{opt}' does not complete the structure correctly. Rule: {e}")
                 else:
                     eo.append(f"Incorrect verb form/tense. '{opt}' does not fit the timeline here. Rule: {e}")
            else:
                eo.append(f"Incorrect option. '{opt}' is not the right choice here. Rule: {e}")
            
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

total_updated = 0

for filepath in files:
    filename = os.path.basename(filepath)
    topic = filename.split('.')[0]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    updated = 0
    for i in range(len(lines)):
        line = lines[i]
        if line.strip().startswith('{') and 'q:' in line:
            parsed = parse_obj(line)
            if parsed:
                q, o, a, e = parsed
                eo_str = generate_eo(q, o, a, e, topic)
                
                if ',eo:' in line:
                     line = re.sub(r',eo:\s*\[.*?\]', lambda m: f',eo:{eo_str}', line)
                     new_line = line
                else:
                    new_line = line.rstrip()
                    if new_line.endswith('},'):
                        new_line = new_line[:-2] + f',eo:{eo_str}' + '},'
                    elif new_line.endswith('}'):
                        new_line = new_line[:-1] + f',eo:{eo_str}' + '}'
                    
                lines[i] = new_line
                updated += 1
                
    if updated > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Updated {updated} questions in {filename}")
        total_updated += updated

print(f"Grand total: {total_updated} questions updated across all topics.")

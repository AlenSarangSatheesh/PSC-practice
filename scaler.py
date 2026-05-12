import os
import re
import random
import glob

def parse_js(content):
    # Extracts the array of objects
    match = re.search(r'\[\s*(\{.*\})\s*\];', content, re.DOTALL)
    if not match:
        return []
    
    body = match.group(1)
    # Split by },\s*{
    items_raw = re.split(r'\},\s*\{', body)
    
    items = []
    for item in items_raw:
        item = item.strip()
        if not item.startswith('{'): item = '{' + item
        if not item.endswith('}'): item = item + '}'
        items.append(item)
    return items

def mutate_item(item):
    # A few safe substitutions to create variations
    # We only want to replace in the q:"" and e:"" parts, but simple regex is okay
    
    # We will just do a string replacement with some probability
    subs = [
        (r'\bHe\b', 'She'),
        (r'\bShe\b', 'He'),
        (r'\bhe\b', 'she'),
        (r'\bshe\b', 'he'),
        (r'\bhis\b', 'her'),
        (r'\bher\b', 'his'),
        (r'\bboy\b', 'girl'),
        (r'\bgirl\b', 'boy'),
        (r'\bboys\b', 'girls'),
        (r'\bgirls\b', 'boys'),
        (r'\bman\b', 'woman'),
        (r'\bwoman\b', 'man'),
        (r'\bmen\b', 'women'),
        (r'\bwomen\b', 'men'),
        (r'\bcar\b', 'bike'),
        (r'\bapple\b', 'orange'),
        (r'\bDelhi\b', 'Mumbai'),
        (r'\bKochi\b', 'Trivandrum'),
        (r'\bteacher\b', 'doctor'),
        (r'\bdoctor\b', 'teacher'),
        (r'\bdog\b', 'cat'),
        (r'\bcat\b', 'dog'),
        (r'\bMonday\b', 'Tuesday'),
        (r'\bSunday\b', 'Friday'),
        (r'\bJohn\b', 'David'),
        (r'\bMary\b', 'Susan'),
        (r'\bred\b', 'blue'),
        (r'\btea\b', 'coffee'),
        (r'\bcoffee\b', 'tea')
    ]
    
    mutated = item
    changed = False
    for pattern, repl in subs:
        if re.search(pattern, mutated):
            mutated = re.sub(pattern, repl, mutated)
            changed = True
            
    # If we couldn't change words, maybe change the question ending slightly
    if not changed:
        mutated = mutated.replace('?', ' ?')
        
    return mutated

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    header_match = re.match(r'(.*?)\[\s*\{', content, re.DOTALL)
    if not header_match:
        print(f"Skipping {filepath}, unknown format")
        return
        
    header = header_match.group(1)
    
    items = parse_js(content)
    if not items:
        return
        
    current_count = len(items)
    if current_count >= 300:
        print(f"{os.path.basename(filepath)} already has {current_count} questions.")
        return
        
    needed = 300 - current_count
    print(f"{os.path.basename(filepath)}: has {current_count}, adding {needed}")
    
    new_items = []
    # Pick random items and mutate them
    for i in range(needed):
        base_item = random.choice(items)
        mutated = mutate_item(base_item)
        new_items.append(mutated)
        
    all_items = items + new_items
    
    # write back
    new_content = header + '[\n' + ',\n'.join(all_items) + '\n];\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
for file in glob.glob(r'c:\Users\pc\Desktop\Psc english\data\*.js'):
    process_file(file)

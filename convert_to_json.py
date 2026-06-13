"""
Convert all data/*.js files to data/*.json for lazy loading.
More robust version that handles edge cases.
"""
import os
import re
import json

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def convert_question_file(filepath):
    """Convert a question .js file to .json using direct eval approach via regex."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    basename = os.path.basename(filepath)
    name_no_ext = os.path.splitext(basename)[0]
    
    # Extract the array: everything between first [ and last ]
    first_bracket = content.find('[')
    last_bracket = content.rfind(']')
    
    if first_bracket == -1 or last_bracket == -1:
        return None
    
    array_str = content[first_bracket:last_bracket+1]
    
    # Step 1: We need to be more careful about quote conversion.
    # The JS uses double-quoted strings throughout (looking at the actual files),
    # but the keys are unquoted JS identifiers: {q:"...", o:[...], a:1, e:"...", eo:[...]}
    
    # Strategy: 
    # 1. Quote the keys (q, o, a, e, eo)
    # 2. Handle any trailing commas
    # 3. The string values are already double-quoted in the source
    
    # The keys in question objects are: q, o, a, e, eo
    # Pattern: match unquoted keys at the start of properties
    
    # First, remove any JS comments
    array_str = re.sub(r'//.*$', '', array_str, flags=re.MULTILINE)
    array_str = re.sub(r'/\*[\s\S]*?\*/', '', array_str)
    
    # Quote unquoted keys - match word characters followed by : that aren't inside strings
    # We'll do this character by character to be safe
    result = quote_js_keys(array_str)
    
    # Remove trailing commas
    result = re.sub(r',\s*([}\]])', r'\1', result)
    
    try:
        data = json.loads(result)
        return data
    except json.JSONDecodeError as e:
        # Find the problematic area
        pos = e.pos if hasattr(e, 'pos') else 0
        context = result[max(0,pos-100):pos+100]
        print(f"  FAIL at pos {pos}: ...{repr(context)}...")
        return None

def quote_js_keys(s):
    """Add quotes around unquoted JS object keys, being careful about strings."""
    result = []
    i = 0
    in_string = False
    string_char = None
    
    while i < len(s):
        c = s[i]
        
        # Handle escape sequences inside strings
        if in_string and c == '\\':
            result.append(c)
            if i + 1 < len(s):
                result.append(s[i+1])
                i += 2
            else:
                i += 1
            continue
        
        # Handle string boundaries
        if c == '"' and not in_string:
            in_string = True
            string_char = '"'
            result.append(c)
            i += 1
            continue
        elif c == '"' and in_string and string_char == '"':
            in_string = False
            string_char = None
            result.append(c)
            i += 1
            continue
        
        # If we're inside a string, just pass through
        if in_string:
            result.append(c)
            i += 1
            continue
        
        # Outside strings: look for unquoted keys
        # Pattern: identifier followed by :
        if c.isalpha() or c == '_':
            # Collect the full identifier
            ident_start = i
            while i < len(s) and (s[i].isalnum() or s[i] == '_'):
                i += 1
            ident = s[ident_start:i]
            
            # Skip whitespace
            j = i
            while j < len(s) and s[j] in ' \t\r\n':
                j += 1
            
            # Check if followed by :
            if j < len(s) and s[j] == ':':
                # This is a key — quote it
                result.append('"')
                result.append(ident)
                result.append('"')
            else:
                # Not a key (could be a value like true, false, null)
                result.append(ident)
            continue
        
        result.append(c)
        i += 1
    
    return ''.join(result)

def convert_textbook_file(filepath):
    """Convert textbooks.js to JSON."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the comment line at top
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Extract the object: everything between first { and last }
    first_brace = content.find('{')
    last_brace = content.rfind('}')
    
    if first_brace == -1 or last_brace == -1:
        return None
    
    obj_str = content[first_brace:last_brace+1]
    
    # Remove single-line comments (// ...) that are NOT inside strings
    # We do this line by line to be safe
    cleaned_lines = []
    for line in obj_str.split('\n'):
        # Simple heuristic: remove // comments that appear outside of strings
        # Find // that isn't inside a quoted string
        in_str = False
        clean_line = []
        ci = 0
        while ci < len(line):
            ch = line[ci]
            if ch == '\\' and in_str and ci + 1 < len(line):
                clean_line.append(ch)
                clean_line.append(line[ci+1])
                ci += 2
                continue
            if ch == '"':
                in_str = not in_str
            if ch == '/' and ci + 1 < len(line) and line[ci+1] == '/' and not in_str:
                break  # Rest of line is a comment
            clean_line.append(ch)
            ci += 1
        cleaned_lines.append(''.join(clean_line))
    obj_str = '\n'.join(cleaned_lines)
    
    # Quote unquoted string keys AND numeric keys
    # Numeric keys like 1: 2: need to be "1": "2":
    result = quote_js_keys_with_numerics(obj_str)
    
    # Remove trailing commas
    result = re.sub(r',\s*([}\]])', r'\1', result)
    
    try:
        data = json.loads(result)
        return data
    except json.JSONDecodeError as e:
        pos = e.pos if hasattr(e, 'pos') else 0
        context = result[max(0,pos-100):pos+100]
        # Print ASCII-safe context
        safe_context = context.encode('ascii', errors='replace').decode('ascii')
        print(f"  FAIL at pos {pos}: ...{safe_context[:150]}...")
        return None

def quote_js_keys_with_numerics(s):
    """Add quotes around unquoted JS object keys including numeric keys."""
    result = []
    i = 0
    in_string = False
    
    while i < len(s):
        c = s[i]
        
        # Handle escape sequences inside strings
        if in_string and c == '\\':
            result.append(c)
            if i + 1 < len(s):
                result.append(s[i+1])
                i += 2
            else:
                i += 1
            continue
        
        # Handle string boundaries (double quotes only)
        if c == '"':
            in_string = not in_string
            result.append(c)
            i += 1
            continue
        
        # If we're inside a string, just pass through
        if in_string:
            result.append(c)
            i += 1
            continue
        
        # Outside strings: look for unquoted keys (identifier or numeric)
        if c.isalpha() or c == '_':
            # Collect the full identifier
            ident_start = i
            while i < len(s) and (s[i].isalnum() or s[i] == '_'):
                i += 1
            ident = s[ident_start:i]
            
            # Skip whitespace
            j = i
            while j < len(s) and s[j] in ' \t\r\n':
                j += 1
            
            # Check if followed by :
            if j < len(s) and s[j] == ':':
                result.append('"')
                result.append(ident)
                result.append('"')
            else:
                result.append(ident)
            continue
        
        # Handle numeric keys: digits followed by :
        if c.isdigit():
            num_start = i
            while i < len(s) and s[i].isdigit():
                i += 1
            num = s[num_start:i]
            
            # Skip whitespace
            j = i
            while j < len(s) and s[j] in ' \t\r\n':
                j += 1
            
            # Check if followed by : (making it a key)
            if j < len(s) and s[j] == ':':
                result.append('"')
                result.append(num)
                result.append('"')
            else:
                result.append(num)
            continue
        
        result.append(c)
        i += 1
    
    return ''.join(result)

def main():
    print("Converting data/*.js -> data/*.json (v2)")
    print("=" * 50)
    
    js_files = sorted([f for f in os.listdir(DATA_DIR) if f.endswith('.js')])
    print(f"Found {len(js_files)} .js files\n")
    
    success = 0
    fail = 0
    
    for f in js_files:
        filepath = os.path.join(DATA_DIR, f)
        name_no_ext = os.path.splitext(f)[0]
        
        if f == 'textbooks.js':
            data = convert_textbook_file(filepath)
        else:
            data = convert_question_file(filepath)
        
        if data is not None:
            json_path = os.path.join(DATA_DIR, name_no_ext + '.json')
            with open(json_path, 'w', encoding='utf-8') as jf:
                json.dump(data, jf, ensure_ascii=False)
            size_kb = os.path.getsize(json_path) / 1024
            count = len(data) if isinstance(data, list) else 'object'
            print(f"  OK: {f} -> {name_no_ext}.json ({size_kb:.0f}KB, {count} items)")
            success += 1
        else:
            print(f"  FAILED: {f}")
            fail += 1
    
    print(f"\n{'='*50}")
    print(f"Results: {success} converted, {fail} failed")
    
    if fail == 0:
        # Count total questions
        total = 0
        for f in js_files:
            if f == 'textbooks.js':
                continue
            name = os.path.splitext(f)[0]
            jpath = os.path.join(DATA_DIR, name + '.json')
            if os.path.exists(jpath):
                with open(jpath, 'r', encoding='utf-8') as jf:
                    d = json.load(jf)
                    if isinstance(d, list):
                        total += len(d)
        print(f"\nTotal questions across all topics: {total}")

if __name__ == '__main__':
    main()

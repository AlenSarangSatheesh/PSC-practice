import os
import json

base_dir = r"c:\Users\pc\Desktop\Psc english\data"

topics_data = {
    "types_of_sentences": [
        {"q": "Transform to assertive: What a beautiful flower it is!", "o": ["It is a very beautiful flower.", "The flower is very beautiful?", "Is it a beautiful flower?", "It was a beautiful flower."], "a": 0, "e": "Exclamatory to assertive removes 'what' and adds 'very/great' before adjective."},
        {"q": "Identify the type of sentence: Please shut the door.", "o": ["Assertive", "Imperative", "Interrogative", "Exclamatory"], "a": 1, "e": "Sentences expressing command, request or advice are Imperative."},
        {"q": "Transform to exclamatory: It is a very cold day.", "o": ["What a cold day!", "What a cold day it is!", "How cold day!", "Is it a cold day?"], "a": 1, "e": "Assertive to exclamatory uses 'what a' for noun phrases."},
        {"q": "Identify the sentence: Did you finish the homework?", "o": ["Assertive", "Imperative", "Interrogative", "Exclamatory"], "a": 2, "e": "Sentences asking questions are Interrogative."},
        {"q": "Transform to assertive: How fast he runs!", "o": ["He runs very fast.", "He run very fast.", "He runs fastly.", "He is running very fast."], "a": 0, "e": "'How' becomes 'very' in assertive sentences."},
        {"q": "Identify the sentence: May God bless you.", "o": ["Optative", "Imperative", "Assertive", "Exclamatory"], "a": 0, "e": "Sentences expressing prayer, wish or curse are Optative."},
        {"q": "Transform to negative: He is always late.", "o": ["He is never late.", "He is not never early.", "He is never early.", "He is not always early."], "a": 2, "e": "To change affirmative to negative without changing meaning, use opposite word + negative (always late = never early)."},
        {"q": "Transform to affirmative: I am not sure.", "o": ["I am unsure.", "I am sure.", "I am doubtful.", "I am certain."], "a": 2, "e": "'Not sure' is affirmatively expressed as 'doubtful'."},
        {"q": "Identify the sentence: Alas! We have lost the match.", "o": ["Assertive", "Imperative", "Interrogative", "Exclamatory"], "a": 3, "e": "Sentences expressing sudden emotion with interjections are Exclamatory."},
        {"q": "Transform to interrogative: Everybody knows him.", "o": ["Does everybody know him?", "Who knows him?", "Who doesn't know him?", "Who did not know him?"], "a": 2, "e": "'Everybody' becomes 'Who doesn't' in rhetorical questions."},
        {"q": "Transform to assertive: If only I could fly!", "o": ["I wish I could fly.", "I can fly.", "I wanted to fly.", "I want to fly."], "a": 0, "e": "'If only' translates to 'I wish' in assertive."},
        {"q": "Transform to negative: Only a fool would do that.", "o": ["None but a fool would do that.", "No one would do that.", "Every fool would do that.", "Never a fool would do that."], "a": 0, "e": "'Only' referring to a person becomes 'None but'."},
        {"q": "Transform to negative: As soon as he saw the tiger, he ran away.", "o": ["No sooner had he saw the tiger than he ran away.", "No sooner did he see the tiger than he ran away.", "As soon as he did not see the tiger, he ran away.", "Hardly he saw the tiger when he ran away."], "a": 1, "e": "'As soon as' becomes 'No sooner...than'."},
        {"q": "Transform to affirmative: There is no smoke without fire.", "o": ["Where there is smoke, there is fire.", "Smoke and fire are there.", "Fire has smoke.", "There is smoke and fire."], "a": 0, "e": "Double negative is removed to create an affirmative equivalence."},
        {"q": "Identify the sentence: Go away.", "o": ["Assertive", "Imperative", "Interrogative", "Exclamatory"], "a": 1, "e": "A command where subject 'you' is hidden is Imperative."}
    ],
    "auxiliary_verbs": [
        {"q": "You _____ obey the traffic rules.", "o": ["can", "may", "must", "might"], "a": 2, "e": "'Must' indicates strong obligation or necessity."},
        {"q": "_____ God bless you!", "o": ["Can", "May", "Shall", "Will"], "a": 1, "e": "'May' is used to express a wish or prayer."},
        {"q": "I _____ swim across the river when I was young.", "o": ["can", "could", "would", "should"], "a": 1, "e": "'Could' indicates past ability."},
        {"q": "_____ I come in, sir?", "o": ["Can", "May", "Will", "Shall"], "a": 1, "e": "'May' is used for seeking formal permission."},
        {"q": "It _____ rain today.", "o": ["can", "must", "might", "shall"], "a": 2, "e": "'Might' or 'may' indicates possibility. 'Might' is weaker possibility."},
        {"q": "We _____ to respect our elders.", "o": ["ought", "should", "must", "can"], "a": 0, "e": "'Ought' is followed by 'to', expressing moral duty."},
        {"q": "You _____ not worry about it.", "o": ["need", "dare", "should", "must"], "a": 0, "e": "'Need not' is used to express absence of obligation."},
        {"q": "How _____ you talk to me like that?", "o": ["need", "dare", "can", "should"], "a": 1, "e": "'Dare' is used to express bold challenge or indignation."},
        {"q": "I _____ rather die than beg.", "o": ["would", "should", "can", "could"], "a": 0, "e": "'Would rather' is used to express preference."},
        {"q": "Walk carefully lest you _____ fall.", "o": ["can", "may", "should", "will"], "a": 2, "e": "'Lest' is always followed by 'should'."},
        {"q": "He _____ be at home now; his car is outside.", "o": ["can", "may", "must", "would"], "a": 2, "e": "'Must' is used for logical deduction or certainty."},
        {"q": "_____ we go for a walk?", "o": ["Shall", "Will", "May", "Can"], "a": 0, "e": "'Shall' is used with I/We for making suggestions."},
        {"q": "You _____ consult a doctor immediately.", "o": ["can", "may", "should", "might"], "a": 2, "e": "'Should' is used to give advice."},
        {"q": "I _____ like to ask a question.", "o": ["should", "would", "can", "may"], "a": 1, "e": "'Would like to' is a polite way of expressing desire."},
        {"q": "She _____ play the piano beautifully.", "o": ["can", "may", "must", "should"], "a": 0, "e": "'Can' expresses present ability."}
    ],
    "nouns_gender_plural": [
        {"q": "What is the plural of 'Child'?", "o": ["Childs", "Childrens", "Children", "Childes"], "a": 2, "e": "'Child' has an irregular plural form: 'Children'."},
        {"q": "What is the feminine gender of 'Horse'?", "o": ["Mare", "Doe", "Vixen", "Sow"], "a": 0, "e": "The feminine of Horse is Mare."},
        {"q": "Identify the collective noun: A _____ of bees.", "o": ["herd", "swarm", "flock", "pride"], "a": 1, "e": "A group of bees is called a swarm."},
        {"q": "What is the plural of 'Radius'?", "o": ["Radiuses", "Radii", "Radies", "Radia"], "a": 1, "e": "Nouns ending in -us (Latin origin) often change to -i in plural."},
        {"q": "What is the masculine gender of 'Niece'?", "o": ["Uncle", "Brother", "Nephew", "Son"], "a": 2, "e": "The masculine of Niece is Nephew."},
        {"q": "Identify the collective noun: A _____ of lions.", "o": ["pack", "pride", "herd", "school"], "a": 1, "e": "A group of lions is called a pride."},
        {"q": "What is the plural of 'Phenomenon'?", "o": ["Phenomenons", "Phenomenas", "Phenomena", "Phenomenia"], "a": 2, "e": "Greek nouns ending in -on change to -a in plural."},
        {"q": "What is the feminine gender of 'Fox'?", "o": ["Foxess", "Vixen", "Doe", "Ewe"], "a": 1, "e": "The feminine of Fox is Vixen."},
        {"q": "What is the plural of 'Brother-in-law'?", "o": ["Brother-in-laws", "Brothers-in-law", "Brothers-in-laws", "Brother-ins-law"], "a": 1, "e": "In compound nouns, the principal word gets pluralized."},
        {"q": "Identify the collective noun: A _____ of fish.", "o": ["school", "fleet", "flock", "pack"], "a": 0, "e": "A group of fish is called a school or shoal."},
        {"q": "What is the plural of 'Mouse'?", "o": ["Mouses", "Mice", "Meese", "Mices"], "a": 1, "e": "Irregular plural: Mouse changes to Mice."},
        {"q": "What is the feminine gender of 'Monk'?", "o": ["Nun", "Priestess", "Monkess", "Lady"], "a": 0, "e": "The feminine of Monk is Nun."},
        {"q": "What is the plural of 'Data'?", "o": ["Datas", "Data", "Datum", "Dates"], "a": 1, "e": "'Data' is already plural (singular is datum), but often used as an uncountable noun too."},
        {"q": "What is the feminine gender of 'Bachelor'?", "o": ["Bachelorette", "Spinster", "Maid", "Both B and C"], "a": 3, "e": "The feminine of Bachelor is Spinster or Maid."},
        {"q": "Identify the collective noun: A _____ of ships.", "o": ["fleet", "flock", "crew", "flight"], "a": 0, "e": "A group of ships is called a fleet."}
    ],
    "word_formation": [
        {"q": "Which prefix can be added to 'legal' to make its opposite?", "o": ["un-", "in-", "il-", "dis-"], "a": 2, "e": "il + legal = illegal."},
        {"q": "Which suffix can be added to 'manage' to form a noun?", "o": ["-ment", "-ness", "-tion", "-ity"], "a": 0, "e": "manage + ment = management."},
        {"q": "Which prefix means 'again'?", "o": ["pre-", "re-", "un-", "mis-"], "a": 1, "e": "'re-' means again, e.g., rewrite."},
        {"q": "Which suffix changes 'danger' into an adjective?", "o": ["-ous", "-ful", "-less", "-able"], "a": 0, "e": "danger + ous = dangerous."},
        {"q": "Add the correct prefix to 'advantage' to make its antonym.", "o": ["un-", "dis-", "in-", "mis-"], "a": 1, "e": "dis + advantage = disadvantage."},
        {"q": "What is the noun form of 'decide'?", "o": ["decidement", "decision", "decidance", "decider"], "a": 1, "e": "The noun form of decide is decision."},
        {"q": "Which suffix means 'full of'?", "o": ["-less", "-ful", "-ness", "-able"], "a": 1, "e": "'-ful' means full of, e.g., beautiful."},
        {"q": "Which prefix makes the word 'regular' negative?", "o": ["un-", "dis-", "in-", "ir-"], "a": 3, "e": "ir + regular = irregular."},
        {"q": "What is the verb form of 'courage'?", "o": ["encourage", "couraging", "courageous", "discourage"], "a": 0, "e": "The verb form is encourage (or discourage for negative)."},
        {"q": "Which prefix can be used with 'understand'?", "o": ["un-", "mis-", "dis-", "in-"], "a": 1, "e": "mis + understand = misunderstand (meaning: understand incorrectly)."},
        {"q": "Which suffix can form an adverb from the adjective 'quick'?", "o": ["-ness", "-ly", "-ment", "-ous"], "a": 1, "e": "quick + ly = quickly."},
        {"q": "What is the adjective form of 'nature'?", "o": ["naturous", "natural", "naturish", "naturely"], "a": 1, "e": "The adjective is natural."},
        {"q": "Which prefix can be added to 'behave'?", "o": ["un-", "mis-", "dis-", "in-"], "a": 1, "e": "mis + behave = misbehave."},
        {"q": "What is the noun form of 'grow'?", "o": ["growing", "grown", "growth", "growness"], "a": 2, "e": "The noun form is growth."},
        {"q": "Which suffix is used to denote a person who performs an action?", "o": ["-ment", "-ness", "-er", "-tion"], "a": 2, "e": "'-er' or '-or' denotes the doer, e.g., teach + er = teacher."}
    ],
    "compound_words": [
        {"q": "Which of the following is a compound word?", "o": ["Beautiful", "Sunlight", "Happiness", "Quickly"], "a": 1, "e": "Sun + Light = Sunlight (two independent words combined)."},
        {"q": "Combine 'moon' and 'light' to form a compound word.", "o": ["Moon-light", "Moonlight", "Moon light", "None of these"], "a": 1, "e": "Moonlight is a closed compound word."},
        {"q": "Which word can be combined with 'water' to form a new word?", "o": ["fall", "run", "jump", "walk"], "a": 0, "e": "Water + fall = Waterfall."},
        {"q": "Identify the hyphenated compound word.", "o": ["Ice cream", "Mother-in-law", "Notebook", "Blackboard"], "a": 1, "e": "Mother-in-law uses hyphens to connect the words."},
        {"q": "Which word can combine with 'foot'?", "o": ["print", "hand", "head", "eye"], "a": 0, "e": "Foot + print = Footprint."},
        {"q": "Identify the open compound word.", "o": ["Ice cream", "Toothbrush", "Well-being", "Raincoat"], "a": 0, "e": "Ice cream is written as two separate words but functions as one concept."},
        {"q": "Combine 'break' and 'fast'.", "o": ["Break-fast", "Breakfast", "Break fast", "Breaksfast"], "a": 1, "e": "Breakfast is a closed compound word."},
        {"q": "Which of the following is NOT a compound word?", "o": ["Basketball", "Bedroom", "Examine", "Sunflower"], "a": 2, "e": "'Examine' is a single base word, not a combination of two words."},
        {"q": "Which word combines with 'news'?", "o": ["book", "paper", "pen", "note"], "a": 1, "e": "News + paper = Newspaper."},
        {"q": "Combine 'passer' and 'by'.", "o": ["Passerby", "Passer-by", "Passer by", "Passersby"], "a": 1, "e": "Passer-by is a hyphenated compound word."},
        {"q": "Which word goes with 'air'?", "o": ["port", "station", "stop", "stand"], "a": 0, "e": "Air + port = Airport."},
        {"q": "What type of compound word is 'six-pack'?", "o": ["Closed", "Open", "Hyphenated", "Not a compound word"], "a": 2, "e": "It uses a hyphen to connect the words."},
        {"q": "Combine 'green' and 'house'.", "o": ["Greenhouse", "Green-house", "Green house", "Greenshouse"], "a": 0, "e": "Greenhouse is a closed compound word."},
        {"q": "Which word combines with 'life'?", "o": ["time", "day", "hour", "year"], "a": 0, "e": "Life + time = Lifetime."},
        {"q": "Identify the compound noun.", "o": ["Underground", "Overcome", "Washing machine", "Worldwide"], "a": 2, "e": "'Washing machine' is a compound noun (open form)." }
    ],
    "foreign_words": [
        {"q": "What is the meaning of the Latin phrase 'Ad hoc'?", "o": ["Forever", "For this specific purpose", "From the beginning", "To the end"], "a": 1, "e": "'Ad hoc' means formed or arranged for a particular purpose."},
        {"q": "What does 'Bona fide' mean?", "o": ["Bad faith", "Good faith / Genuine", "In secret", "By law"], "a": 1, "e": "'Bona fide' means real, genuine, or in good faith."},
        {"q": "Meaning of 'Lingua franca'?", "o": ["French language", "Dead language", "Common language of communication", "Official language"], "a": 2, "e": "'Lingua franca' is a language used for communication between groups who speak different native languages."},
        {"q": "What does 'Prima facie' mean?", "o": ["Prime minister", "At first sight", "Primary face", "First phase"], "a": 1, "e": "'Prima facie' means based on the first impression; accepted as correct until proved otherwise."},
        {"q": "Meaning of 'De facto'?", "o": ["By law", "In fact / Reality", "Out of fact", "Defective"], "a": 1, "e": "'De facto' means existing in fact, whether legally recognized or not."},
        {"q": "What does 'De jure' mean?", "o": ["By right / Legally", "Jury duty", "In reality", "Delayed"], "a": 0, "e": "'De jure' means according to rightful entitlement or claim; by law."},
        {"q": "Meaning of 'Alma mater'?", "o": ["Soul mate", "Old mother", "The school/college one graduated from", "Mother tongue"], "a": 2, "e": "'Alma mater' literally means 'nourishing mother', used for one's former school or university."},
        {"q": "What does 'Vice versa' mean?", "o": ["Vice president", "The other way around", "Bad verses", "Against"], "a": 1, "e": "'Vice versa' means with the main items in the preceding statement the other way around."},
        {"q": "Meaning of 'Status quo'?", "o": ["High status", "The existing state of affairs", "Queue system", "Future state"], "a": 1, "e": "'Status quo' refers to the existing social or political state of affairs."},
        {"q": "What does 'Modus operandi' mean?", "o": ["Modern operation", "Mode of transport", "Method of working", "Medical operation"], "a": 2, "e": "'Modus operandi' is a particular way or method of doing something."},
        {"q": "Meaning of 'Per capita'?", "o": ["Per capital city", "For each person", "Percentage", "Per day"], "a": 1, "e": "'Per capita' translates to 'by heads', meaning for each person."},
        {"q": "What does 'En route' mean?", "o": ["Root cause", "In a routine", "On the way", "End of the route"], "a": 2, "e": "'En route' (French) means during the course of a journey; on the way."},
        {"q": "Meaning of 'Faux pas'?", "o": ["False pass", "A social blunder", "Fox steps", "Fast pace"], "a": 1, "e": "'Faux pas' (French) means an embarrassing or tactless act or remark in a social situation."},
        {"q": "What does 'Magnum opus' mean?", "o": ["Large operation", "Magnificent option", "A great work of art/literature", "Optical illusion"], "a": 2, "e": "'Magnum opus' refers to a large and important work of art, music, or literature, especially one regarded as the most important work of an artist."},
        {"q": "Meaning of 'Ultra vires'?", "o": ["Ultra violet", "Beyond one's legal power", "Extreme virus", "Ultimate victory"], "a": 1, "e": "'Ultra vires' means acting or done beyond one's legal power or authority."}
    ],
    "abbreviations": [
        {"q": "What does 'WHO' stand for?", "o": ["World Health Organization", "World Human Organization", "Wide Health Organization", "World Health Office"], "a": 0, "e": "WHO = World Health Organization."},
        {"q": "What is the expansion of 'ATM'?", "o": ["Any Time Money", "Automated Teller Machine", "Automatic Transaction Machine", "Automobile Transit Mode"], "a": 1, "e": "ATM = Automated Teller Machine."},
        {"q": "What does 'UNESCO' stand for?", "o": ["United Nations Educational, Scientific and Cultural Organization", "United Nations Economic, Social and Cultural Organization", "Universal Educational, Scientific and Cultural Organization", "United Nations Environment, Science and Culture Organization"], "a": 0, "e": "UNESCO is an agency of the United Nations."},
        {"q": "Expand 'NASA'.", "o": ["National Aeronautics and Space Administration", "North American Space Agency", "National Aerospace and Space Administration", "National Agency of Space Administration"], "a": 0, "e": "NASA = National Aeronautics and Space Administration."},
        {"q": "What does 'ISRO' stand for?", "o": ["Indian Space Research Organization", "International Space Research Organization", "Indian Scientific Research Organization", "Indian Space Rocket Organization"], "a": 0, "e": "ISRO = Indian Space Research Organization."},
        {"q": "Expand 'PIN' in PIN code.", "o": ["Personal Identification Number", "Postal Index Number", "Post India Number", "Personal Index Node"], "a": 1, "e": "In postal addresses, PIN = Postal Index Number."},
        {"q": "What does 'FBI' stand for?", "o": ["Federal Bureau of Investigation", "Foreign Bureau of Investigation", "Federal Board of Investigation", "First Bureau of Intelligence"], "a": 0, "e": "FBI = Federal Bureau of Investigation (USA)."},
        {"q": "What is the expansion of 'WWW'?", "o": ["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"], "a": 0, "e": "WWW = World Wide Web."},
        {"q": "Expand 'RAM' in computers.", "o": ["Read Access Memory", "Random Access Memory", "Read And Memorize", "Random Active Memory"], "a": 1, "e": "RAM = Random Access Memory."},
        {"q": "What does 'CCTV' stand for?", "o": ["Closed-Circuit Television", "Common-Circuit Television", "Cable-Circuit Television", "Closed-Cable Television"], "a": 0, "e": "CCTV = Closed-Circuit Television."},
        {"q": "Expand 'VIP'.", "o": ["Very Important Person", "Very Intelligent Person", "Very Impressive Person", "Valid India Passport"], "a": 0, "e": "VIP = Very Important Person."},
        {"q": "What does 'PDF' stand for?", "o": ["Printable Document Format", "Portable Document Format", "Private Document File", "Portable Data File"], "a": 1, "e": "PDF = Portable Document Format."},
        {"q": "Expand 'FIR'.", "o": ["First Investigation Report", "First Information Report", "Formal Information Report", "Final Investigation Report"], "a": 1, "e": "FIR = First Information Report (Police)."},
        {"q": "What does 'KYC' mean in banking?", "o": ["Know Your Customer", "Know Your Cash", "Keep Your Cash", "Know Your Credit"], "a": 0, "e": "KYC = Know Your Customer."},
        {"q": "Expand 'SIM' in SIM card.", "o": ["Subscriber Identity Module", "System Identity Module", "Subscriber Identification Machine", "Smart Identity Module"], "a": 0, "e": "SIM = Subscriber Identity Module."}
    ]
}

for topic, qs in topics_data.items():
    filepath = os.path.join(base_dir, f"{topic}.js")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("window.PSC_QUESTIONS=window.PSC_QUESTIONS||{};\n")
        f.write(f"window.PSC_QUESTIONS.{topic}=[\n")
        
        lines = []
        for q in qs:
            o_str = ",".join([f'"{opt}"' for opt in q['o']])
            line = f'{{q:"{q["q"]}",o:[{o_str}],a:{q["a"]},e:"{q["e"]}"}}'
            lines.append(line)
            
        f.write(",\n".join(lines))
        f.write("\n];\n")
        
print("Successfully generated base topic files.")

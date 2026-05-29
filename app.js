/* ===== Kerala PSC English — App Engine ===== */
(function(){
"use strict";

const TOPICS=[
  {id:"articles",name:"Articles",icon:"📰",cat:"grammar"},
  {id:"prepositions",name:"Prepositions",icon:"📍",cat:"grammar"},
  {id:"tenses",name:"Tenses",icon:"⏳",cat:"grammar"},
  {id:"subject_verb_agreement",name:"Subject-Verb Agreement",icon:"🤝",cat:"grammar"},
  {id:"voice_change",name:"Voice Change",icon:"🔄",cat:"grammar"},
  {id:"reported_speech",name:"Reported Speech",icon:"💬",cat:"grammar"},
  {id:"question_tags",name:"Question Tags",icon:"❓",cat:"grammar"},
  {id:"degrees",name:"Degrees of Comparison",icon:"📊",cat:"grammar"},
  {id:"sentence_correction",name:"Sentence Correction",icon:"✏️",cat:"grammar"},
  {id:"parts_of_speech",name:"Parts of Speech",icon:"🧩",cat:"grammar"},
  {id:"gerunds_infinitives",name:"Gerunds & Infinitives",icon:"🔗",cat:"grammar"},
  {id:"correlatives",name:"Correlatives",icon:"⚖️",cat:"grammar"},
  {id:"types_of_sentences",name:"Types of Sentences",icon:"🔁",cat:"grammar"},
  {id:"auxiliary_verbs",name:"Auxiliary Verbs",icon:"🔑",cat:"grammar"},
  {id:"synonyms_antonyms",name:"Synonyms & Antonyms",icon:"🔤",cat:"vocabulary"},
  {id:"one_word_substitutions",name:"One Word Substitutions",icon:"1️⃣",cat:"vocabulary"},
  {id:"idioms_phrases",name:"Idioms & Phrases",icon:"💎",cat:"vocabulary"},
  {id:"phrasal_verbs",name:"Phrasal Verbs",icon:"🚀",cat:"vocabulary"},
  {id:"spelling",name:"Spelling",icon:"🔡",cat:"vocabulary"},
  {id:"confusing_words",name:"Confusing Words",icon:"🔀",cat:"vocabulary"},
  {id:"nouns_gender_plural",name:"Nouns, Gender & Plural",icon:"👥",cat:"vocabulary"},
  {id:"word_formation",name:"Word Formation",icon:"🏗️",cat:"vocabulary"},
  {id:"compound_words",name:"Compound Words",icon:"🔗",cat:"vocabulary"},
  {id:"foreign_words",name:"Foreign Words",icon:"🌍",cat:"vocabulary"},
  {id:"abbreviations",name:"Abbreviations",icon:"🔠",cat:"vocabulary"}
];
const LABELS=["A","B","C","D"];

/* --- Helpers --- */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function show(id){$$('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0)}
function getQ(id){return(window.PSC_QUESTIONS&&window.PSC_QUESTIONS[id])||[]}

function getWrongReason(topic, opt, rule) {
  if(!opt) return "Incorrect option.";
  const o = opt.toLowerCase().trim();
  if (topic === 'articles') {
    if (o === 'a') return "Incorrect. 'A' is used before consonant sounds.";
    if (o === 'an') return "Incorrect. 'An' is used before vowel sounds.";
    if (o === 'the') return "Incorrect. 'The' is used for specific, known, or unique nouns.";
    if (o === 'no article') return "Incorrect. The context requires an article to modify the noun.";
  }
  if (topic === 'spelling') return `Incorrect. '${opt}' is a misspelled variation.`;
  if (topic === 'synonyms_antonyms' || topic === 'confusing_words') return `Incorrect. '${opt}' does not convey the required meaning here.`;
  if (topic === 'one_word_substitutions') return `Incorrect. '${opt}' represents a different concept or definition.`;
  if (topic === 'idioms_phrases' || topic === 'phrasal_verbs') return `Incorrect. This is not the correct phrase or its meaning does not fit.`;
  if (topic === 'subject_verb_agreement') return `Incorrect verb form. It fails to agree with the subject in number or person.`;
  if (topic === 'tenses') return `Incorrect tense. It does not align with the timeline or time markers in the sentence.`;
  if (topic === 'question_tags') return `Incorrect tag. Ensure the polarity (positive/negative) and auxiliary verb match the statement.`;
  if (topic === 'voice_change') return `Incorrect structure. The tense, subject-object swap, or past participle form is flawed.`;
  if (topic === 'reported_speech') return `Incorrect. Pronouns, tenses, or time markers were not appropriately converted.`;
  if (topic === 'prepositions') return `Incorrect preposition. It does not fit the spatial, temporal, or idiomatic context.`;
  if (topic === 'degrees') return `Incorrect adjective/adverb form. Check the rules for comparative or superlative degrees.`;
  if (topic === 'parts_of_speech') return `Incorrect. This option is not the required part of speech for the sentence structure.`;
  if (topic === 'gerunds_infinitives') return `Incorrect. The verb or context requires either a gerund (-ing) or an infinitive (to + verb).`;
  if (topic === 'correlatives') return `Incorrect. Correlative conjunctions must be properly paired (e.g., either...or, neither...nor).`;
  if (topic === 'sentence_correction') return `Incorrect. This option contains a grammatical, structural, or semantic error.`;
  
  if (rule) return `Incorrect. It violates the core rule: ${rule.charAt(0).toLowerCase() + rule.slice(1)}`;
  return "This option is grammatically incorrect in this context.";
}

/* --- Progress (localStorage) --- */
function getProgress(){try{return JSON.parse(localStorage.getItem("psc_progress"))||{}}catch(e){return{}}}
function saveProgress(p){localStorage.setItem("psc_progress",JSON.stringify(p))}
function recordAnswer(topicId,qIdx,correct,oi){
  if(topicId==='_quickmix')return;
  const p=getProgress();
  if(!p[topicId])p[topicId]={done:0,right:0,answers:{}};
  if(!p[topicId].answers)p[topicId].answers={};
  
  if(p[topicId].answers[qIdx]===undefined){
    p[topicId].done++;
    if(correct)p[topicId].right++;
    p[topicId].answers[qIdx]=oi;
  }
  p[topicId].last=qIdx;
  saveProgress(p);
}

/* --- Landing --- */
function updateLanding(){
  let total=0;
  TOPICS.forEach(t=>{total+=getQ(t.id).length});
  const el=$('#landing-total-qs');
  if(el)el.textContent=total+' Questions';
}

/* --- Topics Grid --- */
function renderTopics(filter){
  const grid=$('#topic-grid');grid.innerHTML='';
  const p=getProgress();
  TOPICS.filter(t=>!filter||filter==='all'||t.cat===filter).forEach(t=>{
    const qs=getQ(t.id);
    const tp=p[t.id]||{done:0,right:0};
    const pct=qs.length?Math.min(100,Math.round(tp.done/qs.length*100)):0;
    const acc=tp.done?Math.round(tp.right/tp.done*100):0;
    const card=document.createElement('div');
    card.className='topic-card';
    card.innerHTML=`
      <div class="tc-header">
        <span class="tc-icon">${t.icon}</span>
        <span class="tc-name">${t.name}</span>
        <span class="tc-cat">${t.cat}</span>
      </div>
      <div class="tc-count">${qs.length} questions</div>
      <div class="tc-bar"><div class="tc-bar-fill" style="width:${pct}%"></div></div>
      <div class="tc-stats"><span>${pct}% done</span><span>${acc}% accuracy</span></div>`;
    card.addEventListener('click',()=>openQuiz(t.id));
    grid.appendChild(card);
  });
}

/* --- Quiz: all questions on one page --- */
let quizState={topicId:null,answered:{}};

function openQuiz(topicId){
  const p=getProgress();
  const tp=p[topicId]||{};
  quizState={topicId,answered:{}};
  const t=TOPICS.find(x=>x.id===topicId);
  const qs=getQ(topicId);
  if(!qs.length){alert('No questions for this topic yet.');return;}

  $('#quiz-title').textContent=t.icon+' '+t.name;
  $('#btn-reset-topic').style.display='inline-block';
  $('#score-correct').textContent='0';
  $('#score-total').textContent='0';
  $('#quiz-summary').textContent='';

  const list=$('#quiz-list');list.innerHTML='';

  qs.forEach((q,i)=>{
    const div=document.createElement('div');
    div.className='q-item';
    div.id='q-'+i;

    let optsHtml='';
    q.o.forEach((opt,oi)=>{
      optsHtml+=`<button class="opt-btn" data-qi="${i}" data-oi="${oi}">
        <span class="opt-lbl">${LABELS[oi]}</span><span>${opt}</span>
      </button>`;
    });

    div.innerHTML=`
      <div class="q-num">Q${i+1}</div>
      <div class="q-text">${q.q}</div>
      <div class="opts">${optsHtml}</div>
      <div class="q-expl" id="expl-${i}"></div>`;
    list.appendChild(div);
  });

  // Attach click handlers to all option buttons
  list.querySelectorAll('.opt-btn').forEach(btn=>{
    btn.addEventListener('click',function(){
      const qi=parseInt(this.dataset.qi);
      const oi=parseInt(this.dataset.oi);
      handleAnswer(qi,oi,qs);
    });
  });

  show('#screen-quiz');

  if(tp.answers){
    Object.keys(tp.answers).forEach(qi=>{
      handleAnswer(parseInt(qi),tp.answers[qi],qs,true);
    });
  }

  if(tp.last!==undefined){
    setTimeout(()=>{
      const el=$('#q-'+tp.last);
      if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
    },100);
  }
}

function handleAnswer(qi,oi,qs,isRestore=false){
  if(quizState.answered[qi]!==undefined)return; // already answered
  quizState.answered[qi]=oi;

  const q=qs[qi];
  const correct=oi===q.a;
  const item=$('#q-'+qi);
  const btns=item.querySelectorAll('.opt-btn');

  // Mark all buttons with inline verdict
  btns.forEach((btn,idx)=>{
    btn.classList.add('locked');
    if(idx===q.a){
      btn.classList.add('correct');
      btn.insertAdjacentHTML('beforeend','<span class="verdict v-correct">✅ Correct</span>');
    }
    if(idx===oi&&!correct){
      btn.classList.add('wrong');
      btn.insertAdjacentHTML('beforeend','<span class="verdict v-wrong">❌ Your answer</span>');
    }
    if(idx!==q.a&&idx!==oi)btn.classList.add('dimmed');
  });

  // Build detailed explanation
  const expl=$('#expl-'+qi);
  let explHtml='<div class="expl-header">'+(correct?'✅ Correct!':'❌ Incorrect')+'</div>';
  if(q.e) explHtml+='<div class="expl-main" style="margin-bottom:12px;">💡 '+q.e+'</div>';
  
  explHtml+='<div class="expl-detail" style="display:flex; flex-direction:column; gap:8px;">';
  
  q.o.forEach((opt, idx) => {
    const isCorrectOpt = (idx === q.a);
    const isChosenOpt = (idx === oi);
    
    let boxClass = isCorrectOpt ? 'expl-right' : 'expl-wrong';
    if(!isCorrectOpt && !isChosenOpt) boxClass = ''; // plain for unchosen wrong options
    
    let bgStyle = isCorrectOpt ? 'background-color: var(--opt-detail-right-bg); border-color: var(--opt-detail-right-border); color: var(--opt-detail-right-color);' : 
                 (isChosenOpt ? 'background-color: var(--opt-detail-wrong-bg); border-color: var(--opt-detail-wrong-border); color: var(--opt-detail-wrong-color);' : 
                 'background-color: var(--opt-detail-neutral-bg); border-color: var(--opt-detail-neutral-border); color: var(--opt-detail-neutral-color);');
                 
    let icon = isCorrectOpt ? '✔' : '✘';
    let chosenText = isChosenOpt ? '<span style="font-size:0.8em; opacity:0.8; float:right;">(Your choice)</span>' : '';
    
    let specificExpl = (q.eo && q.eo[idx]) ? q.eo[idx] : '';
    if (!specificExpl) {
        if (isCorrectOpt) specificExpl = 'This is the correct answer based on the rule above.';
        else {
           let qTopic = (quizState.topicId === '_quickmix') ? q._src : quizState.topicId;
           specificExpl = getWrongReason(qTopic, opt, q.e);
        }
    }
    
    explHtml += `
      <div class="${boxClass}" style="padding:10px; border-radius:6px; border:1px solid; ${bgStyle}">
        <div style="margin-bottom:4px;"><strong>${icon} ${LABELS[idx]}. ${opt}</strong> ${chosenText}</div>
        <div style="font-size:0.9em; opacity:0.9;">↳ ${specificExpl}</div>
      </div>
    `;
  });
  
  explHtml+='</div>';
  expl.innerHTML=explHtml;
  expl.classList.add('show');
  if(!correct)expl.classList.add('wrong-expl');

  // Mark item border
  item.classList.add(correct?'answered-correct':'answered-wrong');

  // Update score
  if(!isRestore){
    recordAnswer(quizState.topicId,qi,correct,oi);
  }
  updateScoreDisplay(qs);
}

function updateScoreDisplay(qs){
  const keys=Object.keys(quizState.answered);
  let right=0;
  keys.forEach(k=>{if(quizState.answered[k]===qs[k].a)right++});
  $('#score-correct').textContent=right;
  $('#score-total').textContent=keys.length;

  if(keys.length===qs.length){
    const pct=Math.round(right/qs.length*100);
    $('#quiz-summary').textContent=`✅ Completed! Score: ${right}/${qs.length} (${pct}%)`;
  }
}

/* --- Quick Mix: 20 random from all topics --- */
function quickMix(){
  let all=[];
  TOPICS.forEach(t=>{getQ(t.id).forEach((q,i)=>all.push({...q,_src:t.id,_i:i}))});
  if(!all.length){alert('No questions loaded.');return;}
  // Shuffle and pick 20
  for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
  all=all.slice(0,20);

  // Temporarily store as a virtual topic
  window.PSC_QUESTIONS._quickmix=all;
  quizState={topicId:'_quickmix',answered:{}};

  $('#quiz-title').textContent='⚡ Quick Mix (20 random)';
  $('#btn-reset-topic').style.display='none';
  $('#score-correct').textContent='0';
  $('#score-total').textContent='0';
  $('#quiz-summary').textContent='';

  const qs=window.PSC_QUESTIONS._quickmix;
  const list=$('#quiz-list');list.innerHTML='';

  qs.forEach((q,i)=>{
    const div=document.createElement('div');
    div.className='q-item';div.id='q-'+i;
    let optsHtml='';
    q.o.forEach((opt,oi)=>{
      optsHtml+=`<button class="opt-btn" data-qi="${i}" data-oi="${oi}">
        <span class="opt-lbl">${LABELS[oi]}</span><span>${opt}</span></button>`;
    });
    div.innerHTML=`<div class="q-num">Q${i+1}</div><div class="q-text">${q.q}</div>
      <div class="opts">${optsHtml}</div><div class="q-expl" id="expl-${i}"></div>`;
    list.appendChild(div);
  });

  list.querySelectorAll('.opt-btn').forEach(btn=>{
    btn.addEventListener('click',function(){
      handleAnswer(parseInt(this.dataset.qi),parseInt(this.dataset.oi),qs);
    });
  });

  show('#screen-quiz');
}

/* --- Theme Toggle --- */
function initThemeToggle(){
  function updateIcons(){
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    document.querySelectorAll('.theme-toggle').forEach(function(btn){ btn.textContent = isDark ? '☀️' : '🌙'; });
  }
  updateIcons();
  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('psc_theme', next);
      updateIcons();
    });
  });
}

/* --- Init --- */
function init(){
  initThemeToggle();
  updateLanding();

  // Landing → Topics
  $('#subject-english').addEventListener('click',()=>{renderTopics('all');show('#screen-topics')});
  $('#btn-back-landing').addEventListener('click',()=>{updateLanding();show('#screen-landing')});

  // Landing → Textbooks
  $('#subject-textbooks').addEventListener('click',()=>{show('#screen-textbooks')});
  $('#btn-back-textbooks').addEventListener('click',()=>{show('#screen-landing')});

  // Textbook sub-options
  $('#tb-scert-malayalam').addEventListener('click',()=>{alert('SCERT Malayalam Medium — Coming Soon!');});
  $('#tb-scert-english').addEventListener('click',()=>{alert('SCERT English Medium — Coming Soon!');});
  $('#tb-scert-manual').addEventListener('click',()=>{alert('Teachers Manual — Coming Soon!');});

    // Topic filters
  $$('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderTopics(btn.dataset.filter);
    });
  });

  // Reset Progress
  const btnReset = $('#btn-reset-progress');
  if(btnReset) {
    btnReset.addEventListener('click', ()=>{
      if(confirm('Are you sure you want to reset all your progress? This cannot be undone.')){
        localStorage.removeItem('psc_progress');
        const activeFilter = $('.filter-btn.active');
        renderTopics(activeFilter ? activeFilter.dataset.filter : 'all');
        updateLanding();
      }
    });
  }

  // Quiz back
  $('#btn-back-topics').addEventListener('click',()=>{renderTopics('all');show('#screen-topics')});
  $('#btn-scroll-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Quick mix
  $('#btn-quick-mix').addEventListener('click',quickMix);

  // Reset Individual Topic
  const btnResetTopic = $('#btn-reset-topic');
  if(btnResetTopic) {
    btnResetTopic.addEventListener('click', () => {
      if(quizState.topicId && quizState.topicId !== '_quickmix') {
        if(confirm('Are you sure you want to reset your progress for this topic?')) {
          const p = getProgress();
          delete p[quizState.topicId];
          saveProgress(p);
          openQuiz(quizState.topicId);
        }
      }
    });
  }

  // Shuffle Quiz
  const btnShuffle = $('#btn-shuffle-quiz');
  if(btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      const list = $('#quiz-list');
      for (let i = list.children.length; i >= 0; i--) {
        list.appendChild(list.children[Math.random() * i | 0]);
      }
      // Scroll to top
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
}

document.addEventListener('DOMContentLoaded',init);
})();

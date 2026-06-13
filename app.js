/* ===== Kerala PSC English — App Engine (Phase 1: Lazy Loading + PWA) ===== */
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

/* --- Data Cache (lazy loaded) --- */
const dataCache = {};
let textbookCache = null;

async function loadTopic(topicId) {
  if (dataCache[topicId]) return dataCache[topicId];
  try {
    const resp = await fetch('data/' + topicId + '.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    dataCache[topicId] = data;
    return data;
  } catch(e) {
    console.error('Failed to load topic:', topicId, e);
    return [];
  }
}

async function loadTextbooks() {
  if (textbookCache) return textbookCache;
  try {
    const resp = await fetch('data/textbooks.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    textbookCache = await resp.json();
    return textbookCache;
  } catch(e) {
    console.error('Failed to load textbooks:', e);
    return {};
  }
}

function getQ(id) { return dataCache[id] || []; }

/* --- Helpers --- */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function show(id, pushHistory = true) {
  $$('.screen').forEach(s=>s.classList.remove('active'));
  const target = $(id);
  target.classList.add('active');
  // Animate in
  target.style.animation = 'none';
  target.offsetHeight; // trigger reflow
  target.style.animation = 'fadeSlideIn 0.3s ease-out';
  window.scrollTo(0,0);
  if (pushHistory) {
    if (!history.state || history.state.id !== id) {
      history.pushState({ id: id }, "", "");
    }
  }
}

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

/* --- Progress Export/Import --- */
function exportProgress() {
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    progress: getProgress(),
    theme: localStorage.getItem('psc_theme') || 'dark'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'psc_progress_' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Progress exported successfully! 📤');
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.progress) throw new Error('Invalid format');
      
      const existing = getProgress();
      const imported = data.progress;
      
      // Merge: imported data takes priority for topics not yet started locally
      // For topics with local progress, keep the one with more answers
      Object.keys(imported).forEach(topicId => {
        if (!existing[topicId] || (imported[topicId].done > (existing[topicId].done || 0))) {
          existing[topicId] = imported[topicId];
        }
      });
      
      saveProgress(existing);
      const activeFilter = $('.filter-btn.active');
      renderTopics(activeFilter ? activeFilter.dataset.filter : 'all');
      showToast('Progress imported successfully! 📥');
    } catch(err) {
      showToast('Invalid progress file. Please try again.', true);
    }
  };
  reader.readAsText(file);
}

/* --- Toast Notification --- */
function showToast(message, isError) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' toast-error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });
  
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* --- Landing --- */
function updateLanding(){
  // Show the static count (we know from conversion: 7502 questions)
  const el=$('#landing-total-qs');
  if(el) el.textContent='7500+ Questions';
}

/* --- Topics Grid --- */
function renderTopics(filter){
  const grid=$('#topic-grid');grid.innerHTML='';
  const p=getProgress();
  const filtered = TOPICS.filter(t=>!filter||filter==='all'||t.cat===filter);
  
  filtered.forEach((t, idx) => {
    const tp=p[t.id]||{done:0,right:0};
    // We know each topic has ~300 questions from conversion
    const estimatedCount = 300;
    const pct=estimatedCount?Math.min(100,Math.round(tp.done/estimatedCount*100)):0;
    const acc=tp.done?Math.round(tp.right/tp.done*100):0;
    const card=document.createElement('div');
    card.className='topic-card';
    card.style.animationDelay = (idx * 0.03) + 's';
    
    // Progress ring SVG
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (pct / 100) * circumference;
    const ringColor = pct === 100 ? 'var(--green)' : acc >= 70 ? 'var(--blue)' : acc >= 40 ? 'var(--orange)' : 'var(--text3)';
    
    card.innerHTML=`
      <div class="tc-header">
        <span class="tc-icon">${t.icon}</span>
        <div class="tc-info">
          <span class="tc-name">${t.name}</span>
          <span class="tc-cat">${t.cat}</span>
        </div>
        <div class="tc-ring">
          <svg viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" stroke-width="3"/>
            <circle cx="22" cy="22" r="18" fill="none" stroke="${ringColor}" stroke-width="3"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
              stroke-linecap="round" transform="rotate(-90 22 22)"
              style="transition: stroke-dashoffset 0.6s ease"/>
          </svg>
          <span class="tc-pct">${pct}%</span>
        </div>
      </div>
      <div class="tc-meta">
        <span>~300 questions</span>
        <span>${tp.done} done</span>
        <span>${acc}% accuracy</span>
      </div>`;
    card.addEventListener('click',()=>openQuiz(t.id));
    grid.appendChild(card);
  });
}

/* --- Quiz: Lazy Loading + Virtual Scrolling --- */
let quizState={topicId:null,answered:{},qs:[]};

// Virtual scrolling: only render visible questions
const RENDER_BUFFER = 5; // questions above/below viewport to pre-render
let renderedRange = { start: -1, end: -1 };
let scrollRAF = null;

async function openQuiz(topicId){
  const p=getProgress();
  const tp=p[topicId]||{};
  
  // Show loading skeleton
  $('#quiz-loading').style.display = 'block';
  $('#quiz-list').innerHTML = '';
  show('#screen-quiz');
  
  const t=TOPICS.find(x=>x.id===topicId);
  $('#quiz-title').textContent=t.icon+' '+t.name;
  $('#btn-reset-topic').style.display='inline-flex';
  $('#score-correct').textContent='0';
  $('#score-total').textContent='0';
  $('#quiz-summary').textContent='';
  
  // Lazy load the topic data
  const qs = await loadTopic(topicId);
  if(!qs.length){
    $('#quiz-loading').style.display = 'none';
    $('#quiz-list').innerHTML = '<p style="text-align:center;color:var(--text2);padding:2rem;">No questions for this topic yet.</p>';
    return;
  }
  
  quizState={topicId, answered:{}, qs};
  
  // Hide loading, render questions
  $('#quiz-loading').style.display = 'none';
  renderAllQuestions(qs, tp);
}

function renderAllQuestions(qs, tp) {
  const list=$('#quiz-list');
  list.innerHTML='';

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

  // Attach click handlers via event delegation on the list
  list.addEventListener('click', function(e) {
    const btn = e.target.closest('.opt-btn');
    if (!btn) return;
    const qi=parseInt(btn.dataset.qi);
    const oi=parseInt(btn.dataset.oi);
    handleAnswer(qi,oi,quizState.qs);
  });

  // Restore previous answers
  if(tp && tp.answers){
    Object.keys(tp.answers).forEach(qi=>{
      handleAnswer(parseInt(qi),tp.answers[qi],qs,true);
    });
  }

  // Scroll to last answered question
  if(tp && tp.last!==undefined){
    setTimeout(()=>{
      const el=$('#q-'+tp.last);
      if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
    },200);
  }
}

function handleAnswer(qi,oi,qs,isRestore=false){
  if(quizState.answered[qi]!==undefined)return; // already answered
  quizState.answered[qi]=oi;

  const q=qs[qi];
  const correct=oi===q.a;
  const item=$('#q-'+qi);
  if (!item) return;
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

  // Animate the result
  if (!isRestore) {
    item.style.animation = 'none';
    item.offsetHeight;
    item.style.animation = correct ? 'correctPulse 0.4s ease' : 'wrongShake 0.4s ease';
  }

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
    if (pct >= 80) {
      showToast('🎉 Excellent! ' + pct + '% accuracy!');
    }
  }
}

/* --- Quick Mix: 20 random from all topics --- */
async function quickMix(){
  // Show loading
  $('#quiz-loading').style.display = 'block';
  $('#quiz-list').innerHTML = '';
  show('#screen-quiz');
  
  $('#quiz-title').textContent='⚡ Quick Mix (20 random)';
  $('#btn-reset-topic').style.display='none';
  $('#score-correct').textContent='0';
  $('#score-total').textContent='0';
  $('#quiz-summary').textContent='';

  // Load 3 random topics and pick questions from them
  const shuffledTopics = [...TOPICS].sort(() => Math.random() - 0.5);
  let all = [];
  
  // Load topics until we have enough questions
  for (const t of shuffledTopics) {
    if (all.length >= 60) break; // load enough to sample from
    const qs = await loadTopic(t.id);
    qs.forEach((q,i) => all.push({...q, _src: t.id, _i: i}));
  }
  
  if(!all.length){
    $('#quiz-loading').style.display = 'none';
    showToast('No questions loaded.', true);
    return;
  }
  
  // Shuffle and pick 20
  for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
  all=all.slice(0,20);

  quizState={topicId:'_quickmix',answered:{},qs:all};
  
  $('#quiz-loading').style.display = 'none';
  
  const list=$('#quiz-list');list.innerHTML='';

  all.forEach((q,i)=>{
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

  list.addEventListener('click', function handler(e) {
    const btn = e.target.closest('.opt-btn');
    if (!btn) return;
    handleAnswer(parseInt(btn.dataset.qi),parseInt(btn.dataset.oi),all);
  });
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

  if (!history.state) {
    history.replaceState({ id: '#screen-landing' }, "", "");
  }
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.id) {
      show(e.state.id, false);
    } else {
      show('#screen-landing', false);
    }
  });

  // Landing → Topics
  $('#subject-english').addEventListener('click',()=>{renderTopics('all');show('#screen-topics')});
  $('#btn-back-landing').addEventListener('click',()=>{updateLanding();history.back()});

  // Landing → Social Science Notes (separate self-contained sub-site)
  const subjectSS = $('#subject-socialscience');
  if (subjectSS) subjectSS.addEventListener('click', () => { location.href = 'notes/index.html'; });

  // Landing → Textbooks → Subjects flow
  let currentCategory = null;
  let currentCategoryName = '';
  let currentClassNum = null;

  async function openClassList(categoryKey, categoryName, categoryIcon) {
    currentCategory = categoryKey;
    currentCategoryName = categoryName;
    $('#classes-title').textContent = categoryIcon + ' ' + categoryName;
    const grid = $('#class-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.innerHTML = `<span class="class-num">${i}</span><span class="class-label">Class ${i}</span>`;
      card.addEventListener('click', () => openSubjects(i));
      grid.appendChild(card);
    }
    show('#screen-classes');
  }

  async function openSubjects(classNum) {
    currentClassNum = classNum;
    const tb = await loadTextbooks();
    const data = tb && tb[currentCategory];
    const subjects = data && data[classNum];

    $('#subjects-title').textContent = '📚 Class ' + classNum;
    $('#subjects-subtitle').textContent = currentCategoryName + ' — Class ' + classNum;

    const grid = $('#subject-grid');
    grid.innerHTML = '';

    if (!subjects || !subjects.length) {
      grid.innerHTML = '<p style="color:var(--text2);font-size:.85rem;padding:1rem 0;">No subjects available for this class yet.</p>';
      show('#screen-subjects');
      return;
    }

    subjects.forEach(sub => {
      const card = document.createElement('div');
      card.className = 'subject-grid-card';
      
      let linksHTML = '';
      
      const createLink = (url, label) => {
        let isDirect = url.toLowerCase().endsWith('.pdf') || url.includes('drive.google.com');
        let attrs = isDirect ? `download=""` : `target="_blank" rel="noopener noreferrer"`;
        let icon = isDirect ? `📥` : `🔗`;
        return `<a href="${url}" class="sg-dl" ${attrs}>${icon} ${label}</a>`;
      };

      if (sub.parts && sub.parts.length > 0) {
        sub.parts.forEach(part => {
          linksHTML += createLink(part.url, part.label);
        });
      } else if (sub.url) {
        let isDirect = sub.url.toLowerCase().endsWith('.pdf') || sub.url.includes('drive.google.com');
        let label = isDirect ? 'Download' : 'Open Portal';
        linksHTML += createLink(sub.url, label);
      }

      card.innerHTML = `
        <span class="sg-icon">${sub.icon}</span>
        <span class="sg-name">${sub.name}</span>
        <div class="sg-links">${linksHTML}</div>
      `;
      grid.appendChild(card);
    });

    show('#screen-subjects');
  }

  $('#subject-textbooks').addEventListener('click',()=>show('#screen-textbooks'));
  $('#tb-scert-malayalam').addEventListener('click', () => openClassList('malayalam', 'SCERT Malayalam Medium', '📖'));
  $('#tb-scert-english').addEventListener('click', () => openClassList('english', 'SCERT English Medium', '📘'));
  $('#tb-scert-manual').addEventListener('click', () => openClassList('manual', 'Teachers Manual', '📝'));

  $('#btn-back-textbooks').addEventListener('click', () => history.back());
  $('#btn-back-classes').addEventListener('click', () => history.back());
  $('#btn-back-subjects').addEventListener('click', () => history.back());

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
        showToast('All progress has been reset.');
      }
    });
  }

  // Export/Import Progress
  const btnExport = $('#btn-export-progress');
  if (btnExport) {
    btnExport.addEventListener('click', exportProgress);
  }
  
  const btnImport = $('#btn-import-progress');
  const fileInput = $('#import-file-input');
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importProgress(e.target.files[0]);
        fileInput.value = ''; // Reset so same file can be re-imported
      }
    });
  }

  // Quiz back
  $('#btn-back-topics').addEventListener('click',()=>{renderTopics('all');history.back()});
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
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
}

document.addEventListener('DOMContentLoaded',init);
})();

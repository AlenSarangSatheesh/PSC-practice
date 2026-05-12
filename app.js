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
  {id:"synonyms_antonyms",name:"Synonyms & Antonyms",icon:"🔤",cat:"vocabulary"},
  {id:"one_word_substitutions",name:"One Word Substitutions",icon:"1️⃣",cat:"vocabulary"},
  {id:"idioms_phrases",name:"Idioms & Phrases",icon:"💎",cat:"vocabulary"},
  {id:"phrasal_verbs",name:"Phrasal Verbs",icon:"🚀",cat:"vocabulary"},
  {id:"spelling",name:"Spelling",icon:"🔡",cat:"vocabulary"},
  {id:"confusing_words",name:"Confusing Words",icon:"🔀",cat:"vocabulary"}
];
const LABELS=["A","B","C","D"];

/* --- Helpers --- */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function show(id){$$('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0)}
function getQ(id){return(window.PSC_QUESTIONS&&window.PSC_QUESTIONS[id])||[]}

/* --- Progress (localStorage) --- */
function getProgress(){try{return JSON.parse(localStorage.getItem("psc_progress"))||{}}catch(e){return{}}}
function saveProgress(p){localStorage.setItem("psc_progress",JSON.stringify(p))}
function recordAnswer(topicId,qIdx,correct){
  const p=getProgress();
  if(!p[topicId])p[topicId]={done:0,right:0};
  p[topicId].done++;
  if(correct)p[topicId].right++;
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
  quizState={topicId,answered:{}};
  const t=TOPICS.find(x=>x.id===topicId);
  const qs=getQ(topicId);
  if(!qs.length){alert('No questions for this topic yet.');return;}

  $('#quiz-title').textContent=t.icon+' '+t.name;
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
}

function handleAnswer(qi,oi,qs){
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
  explHtml+='<div class="expl-main">💡 '+( q.e||'')+'</div>';
  explHtml+='<div class="expl-detail">';
  explHtml+='<div class="expl-right"><strong>✔ '+LABELS[q.a]+'. '+q.o[q.a]+'</strong> is the correct answer.</div>';
  if(!correct){
    explHtml+='<div class="expl-wrong">✘ You chose <strong>'+LABELS[oi]+'. '+q.o[oi]+'</strong> — this is incorrect.</div>';
  }
  explHtml+='</div>';
  expl.innerHTML=explHtml;
  expl.classList.add('show');
  if(!correct)expl.classList.add('wrong-expl');

  // Mark item border
  item.classList.add(correct?'answered-correct':'answered-wrong');

  // Update score
  recordAnswer(quizState.topicId,qi,correct);
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
  window.PSC_QUESTIONS._quickmix=all.map(q=>({q:q.q,o:q.o,a:q.a,e:q.e}));
  quizState={topicId:'_quickmix',answered:{}};

  $('#quiz-title').textContent='⚡ Quick Mix (20 random)';
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

/* --- Init --- */
function init(){
  updateLanding();

  // Landing → Topics
  $('#subject-english').addEventListener('click',()=>{renderTopics('all');show('#screen-topics')});
  $('#btn-back-landing').addEventListener('click',()=>{updateLanding();show('#screen-landing')});

  // Topic filters
  $$('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderTopics(btn.dataset.filter);
    });
  });

  // Quiz back
  $('#btn-back-topics').addEventListener('click',()=>{renderTopics('all');show('#screen-topics')});
  $('#btn-scroll-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Quick mix
  $('#btn-quick-mix').addEventListener('click',quickMix);
}

document.addEventListener('DOMContentLoaded',init);
})();

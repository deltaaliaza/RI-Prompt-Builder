'use strict';
/* No analytics, external APIs or user-data storage. Everything is assembled in the browser. */
(() => {
  const templates = window.RI_TEMPLATES;
  if (!templates) {
    document.getElementById('validation').hidden = false;
    document.getElementById('validation').textContent = '找不到內建 Prompt 模板，請確認 assets/templates.js 已正確載入。';
    return;
  }

  const F = {
    INSTITUTION: ['學校英文名稱','請輸入學校正式英文名稱，例如 National Yang Ming Chiao Tung University','National Yang Ming Chiao Tung University'],
    COLLEGE: ['學院英文名稱','請使用學校正式英文名稱，以協助 RI 辨識組織實體。','College of Management'],
    DEPARTMENT: ['系所英文名稱','請使用正式英文名稱；無所屬學院者可將學院欄留空並在 RI 查核。','Institute of Information Management'],
    RESEARCHER_NAME_EN: ['研究者英文姓名','ORCID 或 ResearcherID 已提供時，本欄可不填。','Jen-Tzung Chien'],
    WOS_RESEARCHER_ID: ['Web of Science ResearcherID','不是員工編號；例如 JFB-0451-2023。未知可留空。','JFB-0451-2023'],
    ORCID: ['ORCID iD','可貼上 16 碼 ORCID 或 https://orcid.org/ 連結；系統會檢查校驗碼。','0000-0003-3466-8941'],
    RESEARCHER_NAME_VARIANTS: ['其他英文發表姓名','如姓名縮寫、不同拼音，使用分號區隔。','J. T. Chien; Chien J-T'],
    CURRENT_AFFILIATION_HINT: ['目前或歷史機構線索','僅供識別作者，不表示 RI 已確認任職狀態。','National Yang Ming Chiao Tung University'],
    ANALYSIS_MODE: ['研究者分析模式','現職教師自評或應聘者研究證據整理，兩者不共用聘任評分。',''],
    DEPARTMENT_STRATEGIC_GOALS: ['系所正式研究發展方向','選填。只填正式提供的方向；不能由 RI 自行推測。','例如：Trusted AI; Digital Health'],
    POSITION_RESEARCH_FOCUS: ['公開徵聘的研究領域','應聘者模式選填。空白表示尚未提供正式徵聘條件。','例如：Information Retrieval; Knowledge Graph'],
    DEPARTMENT_MISSION: ['系所使命','選填。未填時 RI 不會自行創作系所使命。',''],
    ADDITIONAL_EVALUATION_CRITERIA: ['系所增列的品保要求','選填。只填實際要求，不預設 AACSB 等特定學院認證。',''],
    EVALUATION_REFERENCE_PERIOD: ['品保資料期間','選填。與 WoS 出版年度不同；例如 111學年度至114學年度第1學期。','111學年度至114學年度第1學期'],
    EVALUATION_FRAMEWORK: ['品保架構','NYCU_SELF_QA 為內建品保七項；CUSTOM 只依自行填寫的效標整理。',''],
    START_YEAR: ['起始出版年度','設定 WoS 分析使用的第一個出版年度。',''],
    END_YEAR: ['結束出版年度','若包含當年度，RI 應標示截至查詢日的統計。',''],
    TOP_N: ['主要項目列示數量','控制主要研究領域、作者、代表作等前 N 項，並非限制查詢總筆數。',''],
    OUTPUT_LANGUAGE: ['報告輸出語言','預設繁體中文（臺灣用語），輸入的英文學術名稱不翻譯。',''],
    DOCUMENT_TYPE_SCOPE: ['文獻類型','ALL_AVAILABLE 表示不預先限制 WoS 的可取得文獻類型。',''],
    REFERENCE_STYLE: ['參考文獻格式','預設 APA 7th edition。',''],
    INCLUDE_DEPARTMENT_DIAGNOSTICS: ['系所研究能力與發展診斷','研究能力地圖、代表性成就及研究表現缺口。'],
    INCLUDE_RESEARCHER_ANALYSIS: ['研究者分析','系所或學院成果主要貢獻研究者。'],
    INCLUDE_COLLABORATION_ANALYSIS: ['國際合作分析','合作國家、機構、研究網絡與影響力。'],
    INCLUDE_STRATEGIC_RECOMMENDATIONS: ['發展策略建議','將已確認研究證據轉換為參考方向。'],
    INCLUDE_EVALUATION_SUPPORT: ['自主品保佐證支援','依內建七項自主品保架構整理研究佐證。'],
    INCLUDE_EVIDENCE_GAP_ANALYSIS: ['待補資料及研究證據缺口','指出 RI 尚無法支持、需要人工查核的內容。'],
    INCLUDE_SELF_EVALUATION_DRAFT: ['自評參考文字草稿','使用現況、特色、問題與改善方向四個面向。'],
    INCLUDE_REFERENCES: ['APA 參考文獻','在分析報告後列出具名引用文獻。'],
    INCLUDE_DOI: ['附上可確認 DOI','書目 DOI 不得由 RI 自行猜測。'],
    COMPARE_WITH_COLLEGE: ['與所屬學院比較','系所研究定位、規模及研究主題對照。'],
    INCLUDE_BENCHMARK: ['啟用外部比較','最多指定 4 個學院、系所或學術機構。'],
    INCLUDE_CAREER_OVERVIEW: ['完整研究生涯概覽','與選定年度成果分開呈現。'],
    INCLUDE_AUTHORSHIP_ANALYSIS: ['作者角色分析','第一作者、通訊作者等可確認角色。'],
    INCLUDE_RESEARCH_THEME_ANALYSIS: ['研究主題演變','研究專長、成熟與新興研究方向。'],
    INCLUDE_AFFILIATION_SPECIFIC_ANALYSIS: ['依機構歸屬成果分析','避免把所有職涯成果算入目前任職單位。'],
    INCLUDE_SELF_EVALUATION_SUPPORT: ['現職教師自評摘要','僅於教師自評模式執行。'],
    INCLUDE_DEPARTMENT_ALIGNMENT: ['研究者與系所主題對照','僅於應聘者研究證據模式執行。'],
    INCLUDE_DEPARTMENT_RESEARCH_CONTEXT: ['嘗試取得系所研究背景','由 RI 查詢指定系所 Entity；不可用全校資料代替。']
  };
  for (let i = 1; i <= 4; i++) F[`BENCHMARK_${i}`] = [`比較對象 ${i}（英文名稱）`, '建議填入完整學校與院系英文名；不填則略過。', '例如 National Taiwan University College of Management'];

  const configs = {
    college: [
      ['base','基本資料','請填學校與學院的正式英文名稱，以及研究分析年份。',['INSTITUTION','COLLEGE','START_YEAR','END_YEAR','TOP_N']],
      ['bench','外部比較對象','模板原有設定會保留；若不需要比較，請在進階選項關閉。',['BENCHMARK_1','BENCHMARK_2','BENCHMARK_3','BENCHMARK_4']],
      ['opts','研究分析功能','可以關閉不需要的研究模組。',['INCLUDE_RESEARCHER_ANALYSIS','INCLUDE_COLLABORATION_ANALYSIS','INCLUDE_STRATEGIC_RECOMMENDATIONS','INCLUDE_BENCHMARK','INCLUDE_REFERENCES','INCLUDE_DOI']],
      ['output','輸出細節','報告語言與參考文獻規格。',['OUTPUT_LANGUAGE','REFERENCE_STYLE']]
    ],
    department: [
      ['base','基本資料','填寫正式英文學校、學院及系所名稱，以及研究期間。',['INSTITUTION','COLLEGE','DEPARTMENT','START_YEAR','END_YEAR','TOP_N']],
      ['qa','自主品質保證設定','預設使用陽明交大內建的七項品保架構；院級、系級特殊效標可另填。',['EVALUATION_FRAMEWORK','EVALUATION_REFERENCE_PERIOD','DEPARTMENT_MISSION','DEPARTMENT_STRATEGIC_GOALS','ADDITIONAL_EVALUATION_CRITERIA']],
      ['opts','研究與品保功能','保留原模板各項分析開關。',['INCLUDE_DEPARTMENT_DIAGNOSTICS','INCLUDE_RESEARCHER_ANALYSIS','INCLUDE_COLLABORATION_ANALYSIS','INCLUDE_STRATEGIC_RECOMMENDATIONS','INCLUDE_EVALUATION_SUPPORT','INCLUDE_EVIDENCE_GAP_ANALYSIS','INCLUDE_SELF_EVALUATION_DRAFT','COMPARE_WITH_COLLEGE','INCLUDE_BENCHMARK','INCLUDE_REFERENCES','INCLUDE_DOI']],
      ['bench','外部比較對象','只有啟用外部 Benchmark 時才會使用。',['BENCHMARK_1','BENCHMARK_2','BENCHMARK_3','BENCHMARK_4']],
      ['output','輸出細節','文獻類型、報告語言與書目格式。',['DOCUMENT_TYPE_SCOPE','OUTPUT_LANGUAGE','REFERENCE_STYLE']]
    ],
    researcher: [
      ['mode','分析用途','現職教師自評，或提供應聘者學術研究證據供委員參考。',['ANALYSIS_MODE']],
      ['identity','研究者身分辨識','英文姓名、ORCID、WoS ResearcherID 三者至少填一項；建議盡量提供識別碼。',['RESEARCHER_NAME_EN','WOS_RESEARCHER_ID','ORCID','RESEARCHER_NAME_VARIANTS','CURRENT_AFFILIATION_HINT']],
      ['base','目標學校與系所','應聘者模式中，這裡填的是「徵聘方」，而非研究者現任機構。',['INSTITUTION','COLLEGE','DEPARTMENT','START_YEAR','END_YEAR','TOP_N']],
      ['focus','研究方向與徵聘條件','只在應聘者模式顯示；均為選填。',['DEPARTMENT_STRATEGIC_GOALS','POSITION_RESEARCH_FOCUS']],
      ['opts','研究分析功能','依分析用途啟用各模組。',['INCLUDE_CAREER_OVERVIEW','INCLUDE_AUTHORSHIP_ANALYSIS','INCLUDE_COLLABORATION_ANALYSIS','INCLUDE_RESEARCH_THEME_ANALYSIS','INCLUDE_AFFILIATION_SPECIFIC_ANALYSIS','INCLUDE_EVIDENCE_GAP_ANALYSIS','INCLUDE_SELF_EVALUATION_SUPPORT','INCLUDE_DEPARTMENT_ALIGNMENT','INCLUDE_DEPARTMENT_RESEARCH_CONTEXT','INCLUDE_BENCHMARK','INCLUDE_REFERENCES','INCLUDE_DOI']],
      ['bench','研究環境比較對象','僅用於比較學術機構背景，不用於應聘者評分或排名。',['BENCHMARK_1','BENCHMARK_2','BENCHMARK_3','BENCHMARK_4']],
      ['output','輸出細節','文獻類型、報告語言與書目格式。',['DOCUMENT_TYPE_SCOPE','OUTPUT_LANGUAGE','REFERENCE_STYLE']]
    ]
  };

  const $ = selector => document.querySelector(selector);
  const byId = id => document.getElementById(id);
  const drafts = Object.fromEntries(Object.entries(templates).map(([key, t]) => [key, structuredClone(t.defaults)]));
  let current = 'college';
  let generated = '';
  let generatedFilename = '';
  let openStates = {opts:false,output:false,qa:false,bench:false,focus:false};

  const isBenchmark = key => /^BENCHMARK_[1-4]$/.test(key);
  const val = key => drafts[current][key];
  const note = key => F[key] || [key, ''];
  const showField = (key) => {
    if (isBenchmark(key) && !val('INCLUDE_BENCHMARK')) return false;
    if (current === 'researcher') {
      const mode = val('ANALYSIS_MODE');
      if (key === 'INCLUDE_SELF_EVALUATION_SUPPORT' && mode !== 'FACULTY_SELF_REVIEW') return false;
      if (['DEPARTMENT_STRATEGIC_GOALS','POSITION_RESEARCH_FOCUS','INCLUDE_DEPARTMENT_ALIGNMENT','INCLUDE_DEPARTMENT_RESEARCH_CONTEXT'].includes(key) && mode !== 'APPLICANT_RESEARCH_REVIEW') return false;
    }
    return true;
  };
  const showGroup = g => {
    if (g === 'bench' && !val('INCLUDE_BENCHMARK')) return false;
    if (g === 'focus' && current === 'researcher' && val('ANALYSIS_MODE') !== 'APPLICANT_RESEARCH_REVIEW') return false;
    return true;
  };
  const required = key => {
    if (key === 'INSTITUTION' || key === 'START_YEAR' || key === 'END_YEAR') return true;
    if (key === 'COLLEGE' && current === 'college') return true;
    if (key === 'DEPARTMENT' && current === 'department') return true;
    return false;
  };
  const englishFields = new Set(['INSTITUTION','COLLEGE','DEPARTMENT','RESEARCHER_NAME_EN','RESEARCHER_NAME_VARIANTS','CURRENT_AFFILIATION_HINT']);
  const row = (cls) => { const el = document.createElement('div'); el.className = cls; return el; };
  const labelEl = (text, forId) => { const l = document.createElement('label'); l.textContent = text; if(forId)l.htmlFor=forId; return l; };

  function field(key) {
    if (!showField(key)) return null;
    const [title, hint, placeholder] = note(key);
    const wrapper = row('field' + (['INSTITUTION','DEPARTMENT_STRATEGIC_GOALS','DEPARTMENT_MISSION','ADDITIONAL_EVALUATION_CRITERIA','CURRENT_AFFILIATION_HINT','POSITION_RESEARCH_FOCUS'].includes(key) ? ' wide':'') );
    const label = labelEl(title, 'f-'+key);
    if(required(key)) {const a=document.createElement('span');a.textContent=' *';a.className='required';label.append(a);}
    wrapper.append(label);
    const v=val(key);let input;
    if (key === 'ANALYSIS_MODE' || key === 'EVALUATION_FRAMEWORK') {
      input=document.createElement('select');
      const opts = key==='ANALYSIS_MODE' ? [['FACULTY_SELF_REVIEW','現職教師研究自評'],['APPLICANT_RESEARCH_REVIEW','應聘者研究證據分析']] : [['NYCU_SELF_QA','陽明交大自主品保（七項架構）'],['CUSTOM','自訂品保條件（需自行提供）']];
      for(const [id,text] of opts){const o=document.createElement('option');o.value=id;o.textContent=text;input.append(o);}
      input.value=v;
    } else if (typeof v === 'boolean') {
      const toggle = row('toggle-row');
      const left = document.createElement('div');
      const t = document.createElement('div');t.className='toggle-label';t.textContent=title;
      const d = document.createElement('div');d.className='toggle-desc';d.textContent=hint||'';
      left.append(t,d);
      input=document.createElement('input');input.type='checkbox';input.className='toggle-control';input.checked=v;input.id='f-'+key;
      input.setAttribute('aria-label',title);input.dataset.key=key;input.name=key;
      toggle.append(left,input);return toggle;
    } else if (['DEPARTMENT_STRATEGIC_GOALS','DEPARTMENT_MISSION','POSITION_RESEARCH_FOCUS','ADDITIONAL_EVALUATION_CRITERIA'].includes(key)) {
      input=document.createElement('textarea');input.rows=3;input.value=v;input.placeholder=placeholder||'';
    } else {
      input=document.createElement('input');input.type=(typeof v === 'number')?'number':'text';
      if (typeof v === 'number') { input.min=(key==='TOP_N'?'1':'1900');input.max=(key==='TOP_N'?'50':'2100');input.step='1'; }
      if (key==='ORCID') input.inputMode='text';
      input.value=v;input.placeholder=placeholder||'';
    }
    input.id='f-'+key;input.name=key;input.dataset.key=key;
    input.autocomplete='off';
    wrapper.append(input);
    if(hint){const h=document.createElement('span');h.className='field-hint';h.textContent=hint;wrapper.append(h);input.setAttribute('aria-describedby','hint-'+key);h.id='hint-'+key;}
    return wrapper;
  }

  function card(group,name,desc,keys) {
    const visible=keys.filter(k=>showField(k) && Object.hasOwn(drafts[current],k));
    if (!visible.length || !showGroup(group)) return null;
    const advanced=['opts','output','qa','bench','focus'].includes(group);
    let holder,inside;
    if(advanced) {
      holder=document.createElement('details');holder.className='form-card advanced';holder.dataset.group=group;
      holder.open=group==='bench' || (group==='qa' && current==='department') || (group==='focus' && current==='researcher') || !!openStates[group];
      const summary=document.createElement('summary');summary.textContent=name;holder.append(summary);
      inside=row('advanced-body');holder.append(inside);
      if(desc){const p=document.createElement('p');p.className='card-desc';p.textContent=desc;inside.append(p);}
    } else {
      holder=document.createElement('div');holder.className='form-card';
      const h=document.createElement('h3');h.textContent=name;holder.append(h);
      const p=document.createElement('p');p.className='card-desc';p.textContent=desc;holder.append(p);inside=holder;
    }
    const grid=row('field-grid');inside.append(grid);
    for(const key of visible){const f=field(key);if(f)grid.append(f);}
    return holder;
  }

  function renderForm() {
    document.querySelectorAll('details[data-group]').forEach(d=>{openStates[d.dataset.group]=d.open});
    const root=byId('prompt-form');root.replaceChildren();
    for(const config of configs[current]) {const el=card(...config);if(el)root.append(el);}
    // prevent page refresh if user presses enter inside a field
    root.addEventListener('submit',e=>e.preventDefault(),{once:true});
    updateSummary();
  }

  const modeLabel = mode => mode==='APPLICANT_RESEARCH_REVIEW'?'應聘研究證據':'現職教師自評';
  function updateSummary() {
    const t=templates[current];
    byId('summary-title').textContent=t.zh;
    byId('summary-version').textContent=t.version;
    const rows=byId('summary-rows');rows.replaceChildren();
    const summary=[
      ['分析範圍',`${val('START_YEAR')}–${val('END_YEAR')}`],
      ['目標單位',val(current==='college'?'COLLEGE':'DEPARTMENT')||'待填寫'],
      ['分析模式',current==='researcher'?modeLabel(val('ANALYSIS_MODE')):current==='department'?'研究分析＋品保佐證':'學院研究分析'],
      ['外部比較',val('INCLUDE_BENCHMARK')?'已啟用':'未啟用'],
      ['原始模板',t.version]
    ];
    if(current==='researcher') summary.splice(2,0,['研究者',val('RESEARCHER_NAME_EN')||val('ORCID')||val('WOS_RESEARCHER_ID')||'待填寫']);
    for(const [label,value] of summary) {
      const item=row('summary-line');const a=document.createElement('span');a.textContent=label;const b=document.createElement('span');b.textContent=String(value);item.append(a,b);rows.append(item);
    }
    byId('summary-status').textContent=generated?'已產生完整 Prompt。修改任何欄位後請重新產生。':'填寫完畢後，按下「產生完整 Prompt」。';
  }
  const debounceWarn = () => { const v=byId('validation');if(!v.hidden && !v.classList.contains('warning')){v.hidden=true;} };
  function changeType(type) {
    if(!templates[type] || current===type) return;
    current=type;generated='';byId('output-section').hidden=true;
    byId('validation').hidden=true;openStates={opts:false,output:false,qa:false,bench:false,focus:false};
    document.querySelectorAll('.type-card').forEach(c=>{const sel=c.dataset.type===type;c.classList.toggle('selected',sel);c.setAttribute('aria-pressed',String(sel));});
    renderForm();
  }
  function normalizeORCID(v){
    const raw=String(v||'').trim().replace(/^https?:\/\/(?:www\.)?orcid\.org\//i,'').replace(/\s+/g,'');
    if(!raw) return '';
    return raw.toUpperCase();
  }
  function validORCID(orcid){
    if(!/^\d{4}-\d{4}-\d{4}-[\dX]{4}$/.test(orcid)) return false;
    const digits=orcid.replaceAll('-','');let acc=0;
    for(let i=0;i<15;i++) acc=(acc+Number(digits[i]))*2;
    const rest=(12-(acc%11))%11;
    return (rest===10?'X':String(rest))===digits[15];
  }
  function getErrorList() {
    const errors=[],warnings=[];const d=drafts[current];
    for(const k of ['INSTITUTION','START_YEAR','END_YEAR',...(current==='college'?['COLLEGE']:[]),...(current==='department'?['DEPARTMENT']:[])]){
      if(d[k]===undefined || String(d[k]).trim()==='') errors.push(`${note(k)[0]}為必填。`);
    }
    const sy=Number(d.START_YEAR), ey=Number(d.END_YEAR);
    if(!Number.isInteger(sy) || !Number.isInteger(ey) || sy<1900 || ey>2100 || sy>ey) errors.push('請輸入有效的出版年度（起始年不可晚於結束年）。');
    if(!Number.isInteger(Number(d.TOP_N)) || +d.TOP_N<1 || +d.TOP_N>50) errors.push('主要項目列示數量請設定在 1–50 之間。');
    if(current==='researcher') {
      if(![d.RESEARCHER_NAME_EN,d.WOS_RESEARCHER_ID,d.ORCID].some(x=>String(x||'').trim())) errors.push('研究者英文姓名、ORCID 或 WoS ResearcherID 至少填寫一項。');
      if(d.ORCID && !validORCID(normalizeORCID(d.ORCID))) errors.push('ORCID 格式或校驗碼不正確，請使用 16 碼 ID 或 orcid.org 官方連結。');
      if(d.WOS_RESEARCHER_ID && !/^[A-Z0-9]{1,12}-\d{3,8}-\d{4}$/i.test(d.WOS_RESEARCHER_ID.trim())) warnings.push('Web of Science ResearcherID 看起來不是常見格式，請再次確認。');
      if(d.ANALYSIS_MODE==='APPLICANT_RESEARCH_REVIEW' && !String(d.DEPARTMENT||'').trim()) warnings.push('尚未填目標系所，無法完整進行應聘者與系所研究方向對照。');
    }
    if(d.INCLUDE_BENCHMARK && ![1,2,3,4].some(i=>String(d[`BENCHMARK_${i}`]||'').trim())) warnings.push('已啟用 Benchmark 但未填入任何比較單位；RI 會依原始模板規則略過比較。');
    for(const k of englishFields){if(d[k] && /[\u3400-\u9fff]/.test(String(d[k]))) warnings.push(`${note(k)[0]}含有中文字元；為提升 WoS 辨識率，建議改填正式英文名稱。`);}
    if(current==='department' && d.EVALUATION_FRAMEWORK==='CUSTOM' && !String(d.ADDITIONAL_EVALUATION_CRITERIA||'').trim()) warnings.push('品保架構設定為自訂，但尚未填入自訂品保條件。');
    if(current==='department' && d.INSTITUTION && !/yang ming chiao tung/i.test(d.INSTITUTION) && d.EVALUATION_FRAMEWORK==='NYCU_SELF_QA' && d.INCLUDE_EVALUATION_SUPPORT) warnings.push('目前選擇陽明交大品保架構，對其他學校僅能作為參考，不能視為正式規定。');
    return {errors,warnings};
  }
  function showMessages(errors,warnings){
    const root=byId('validation');root.replaceChildren();
    const all=[...errors,...warnings];if(!all.length){root.hidden=true;return;}
    root.hidden=false;root.className='validation'+(!errors.length?' warning':'');
    const strong=document.createElement('strong');strong.textContent=errors.length?'請先修正以下欄位：':'提醒：請確認以下資訊';root.append(strong);
    const ul=document.createElement('ul');for(const issue of all){const li=document.createElement('li');li.textContent=issue;ul.append(li);}root.append(ul);
  }
  // Preserve all original prompt instructions. Only override known variable declarations
  // in the GLOBAL PARAMETERS section, then resolve explicit {{KEY}} references.
  function buildPrompt(t,values) {
    const i=t.raw.indexOf(t.endMarker);
    if(i<0) throw new Error('模板缺少全域設定結束標記，無法安全產生。');
    const config=t.raw.slice(0,i).split('\n').map(line=>{
      const m=line.match(/^(\s*)([A-Z][A-Z0-9_]*):(\s*)(.*)$/);
      if(!m || !Object.hasOwn(t.defaults,m[2])) return line;
      const v=values[m[2]];
      const encoded=typeof v==='string'?JSON.stringify(v):String(v);
      return `${m[1]}${m[2]}:${m[3] || ' '}${encoded}`;
    }).join('\n');
    const tail=t.raw.slice(i);
    const all=config+tail;
    return all.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g,(full,key)=>{
      if(!Object.hasOwn(values,key)) return full; // e.g. generic VARIABLE_NAME examples remain literal
      const v=values[key];return typeof v==='boolean'?(v?'true':'false'):String(v);
    });
  }
  function generate() {
    const d=drafts[current];
    if(d.ORCID) { d.ORCID=normalizeORCID(d.ORCID);const el=byId('f-ORCID');if(el)el.value=d.ORCID; }
    const {errors,warnings}=getErrorList();showMessages(errors,warnings);
    if(errors.length){byId('validation').scrollIntoView({behavior:'smooth',block:'center'});return;}
    const t=templates[current];
    generated=buildPrompt(t,d);
    generatedFilename=`RI_${current}_${t.version.replaceAll('.','_')}_${d.START_YEAR}-${d.END_YEAR}`;
    byId('output-text').value=generated;
    byId('output-meta').textContent=`${t.zh} · ${generated.length.toLocaleString('zh-TW')} 字元 · ${t.version}`;
    byId('output-filename').textContent=generatedFilename+'.txt';
    byId('copy-status').textContent='';
    byId('output-section').hidden=false;
    updateSummary();
    byId('output-section').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function copyText(){
    if(!generated)return;
    try { await navigator.clipboard.writeText(generated);byId('copy-status').textContent='完整 Prompt 已複製。'; }
    catch {const text=byId('output-text');text.focus();text.select();try{const yes=document.execCommand('copy');byId('copy-status').textContent=yes?'完整 Prompt 已複製。':'請在選取文字後按 Ctrl+C 複製。';}catch{byId('copy-status').textContent='請在選取文字後按 Ctrl+C 複製。';}}
  }
  function download(ext){
    if(!generated)return;
    const blob=new Blob([generated],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=generatedFilename+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.querySelectorAll('.type-card').forEach(card=>card.addEventListener('click',()=>changeType(card.dataset.type)));
  byId('prompt-form').addEventListener('input',e=>{
    const target=e.target;const k=target.dataset.key || target.name;
    if(!k||!Object.hasOwn(drafts[current],k)) return;
    drafts[current][k]=target.type==='checkbox'?target.checked:target.type==='number'?(target.value===''?'':Number(target.value)):target.value;
    generated='';byId('output-section').hidden=true;debounceWarn();updateSummary();
    if((k==='INCLUDE_BENCHMARK' || k==='ANALYSIS_MODE') && e.type==='input') renderForm();
  });
  byId('prompt-form').addEventListener('change',e=>{
    const k=e.target.dataset.key || e.target.name;
    if(k==='INCLUDE_BENCHMARK' || k==='ANALYSIS_MODE' || k==='EVALUATION_FRAMEWORK') renderForm();
  });
  byId('generate-btn').addEventListener('click',generate);
  byId('reset-btn').addEventListener('click',()=>{
    drafts[current]=structuredClone(templates[current].defaults);
    generated='';byId('validation').hidden=true;byId('output-section').hidden=true;
    openStates={opts:false,output:false,qa:false,bench:false,focus:false};renderForm();
  });
  byId('copy-btn').addEventListener('click',copyText);
  byId('download-txt-btn').addEventListener('click',()=>download('txt'));
  byId('download-md-btn').addEventListener('click',()=>download('md'));
  renderForm();
})();

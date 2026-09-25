(function(){
const axes=['body','ability','control','production','responsibility'];
const names={body:'신체',ability:'능력',control:'통제',production:'생산',responsibility:'책임',impact:'현실 영향',action:'행동',adoption:'채택'};
const english={body:'BODY',ability:'ABILITY',control:'CONTROL',production:'PRODUCTION',responsibility:'RESPONSIBILITY'};
const weights={body:[.35,.25,.20,.20],ability:[.30,.25,.25,.20],control:[.30,.25,.25,.20],production:[.30,.25,.20,.15,.10],responsibility:[.30,.30,.25,.15]};
const subaxes={body:['힘','지속능력','움직임','신체 유지력'],ability:['전문성','전이 능력','문제 복잡도','학습 속도'],control:['약속 이행','지속성','방해 극복','복구 속도'],production:['완성 산출물','기능적 품질','제작 난도','완결성','재현성'],responsibility:['책임의 범위','실패의 영향','유지 기간','안정적 유지']};
const roman=['—','I','II','III','IV','V','VI','VII','VIII','IX','X'];
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const day=()=>new Date().toLocaleDateString('sv-SE');
function weighted(axis,values){if(!values||values.length!==weights[axis]?.length||values.some(v=>!Number.isFinite(v)||v<0||v>100))return null;return values.reduce((s,v,i)=>s+v*weights[axis][i],0);}
function geometric(values,ws=values.map(()=>1/values.length)){if(values.some(v=>v==null||!Number.isFinite(v)))return null;return Math.exp(values.reduce((s,v,i)=>s+Math.log(Math.max(1,v))*ws[i],0));}
function posterior(observations,now=new Date()){
 if(!observations.length)return null;
 let precision=0,sum=0;for(const o of observations){const age=Math.max(0,(now-new Date(o.date))/86400000);const tau=[25,20,14,10,6,4][Math.min(o.level??0,5)]*(1+Math.max(0,age-30)/180);const p=1/(tau*tau);precision+=p;sum+=o.value*p;}
 const sigma=Math.sqrt(1/precision);return {mu:sum/precision,sigma,confidence:Math.round(clamp(100*(1-sigma/30),0,99)),lower:clamp(sum/precision-.674*sigma)};
}
function rankFor(influence,stats){if(influence==null||axes.some(a=>!stats[a]))return null;let rank=Math.min(10,Math.floor(influence/10)+1);const min=Math.min(...axes.map(a=>stats[a].lower));while(rank>=7&&min<(rank-3)*10)rank--;return rank;}
function classify(text){if(/사용자|행동.*변화|유지율|재사용|절감/.test(text))return 'impact';if(/다운로드|조회|팔로워/.test(text))return 'adoption';if(/벤치|스쿼트|풀업|푸쉬업|달리기|km|체력/.test(text))return 'body';if(/가족|아내|부모|돌봄|반려|의무/.test(text))return 'responsibility';if(/약속|계획|미루|복귀|마감/.test(text))return 'control';if(/완성|배포|출시|구현|제작|문서|작동/.test(text))return 'production';if(/해결|학습|기술|설계|시험/.test(text))return 'ability';return 'action';}
function impactValue(m){if(!m||!Number.isFinite(m.reach)||m.reach<0)return null;return clamp(100*(1-Math.exp(-Math.log1p(m.reach)*m.depth*(1-Math.exp(-m.days/90))*m.attribution/5)));}
function compute(data,window='form',now=new Date()){
 const limit=window==='current'?30:window==='form'?365:Infinity;
 const records=data.records.filter(r=>!r.archived&&new Date(r.date+'T00:00:00')<=now&&(now-new Date(r.date+'T00:00:00'))/86400000<=limit);
 const stats={};for(const a of axes){const obs=records.filter(r=>r.axis===a&&r.values).map(r=>({date:r.date,value:weighted(a,r.values),level:r.level??0})).filter(o=>o.value!=null);stats[a]=posterior(obs,now);}
 const impacts=records.filter(r=>r.axis==='impact'&&r.metrics).map(r=>({...r,value:impactValue(r.metrics)})).filter(r=>r.value!=null);
 const impact=impacts.length?impacts.reduce((s,r)=>s+r.value,0)/impacts.length:null;
 const months=new Set(impacts.map(r=>r.date.slice(0,7))).size;
 const repeatability=impacts.length?clamp(20+months*10+Math.min(4,impacts.length)*5):null;
 const power=geometric(axes.map(a=>stats[a]?.mu));
 const influence=geometric([power,impact,repeatability],[.35,.4,.25]);
 const conservative=geometric([geometric(axes.map(a=>stats[a]?.lower)),impact,repeatability],[.35,.4,.25]);
 const rank=window==='form'?rankFor(conservative,stats):compute(data,'form',now).rank;
 const confidence=Math.round(axes.reduce((s,a)=>s+(stats[a]?.confidence??0),0)/5);
 const missing=axes.find(a=>!stats[a]);const uncertain=axes.find(a=>stats[a]?.confidence<50);
 const effects=axes.map(a=>{const changed=axes.map(b=>stats[b]?Math.min(100,stats[b].mu+(b===a?5:0)):null);const next=geometric([geometric(changed),impact,repeatability],[.35,.4,.25]);return {axis:a,delta:next==null?null:next-influence};});
 effects.push({axis:'impact',delta:influence==null?null:geometric([power,Math.min(100,impact+5),repeatability],[.35,.4,.25])-influence});
 const bottleneck=missing||uncertain||[...effects].sort((a,b)=>(b.delta??0)-(a.delta??0))[0].axis;
 return {stats,power,impact,repeatability,influence,conservative,rank,confidence,effects,bottleneck,evidenceBottleneck:!!(missing||uncertain),records};
}
function validateRecord(r,records){if(!r.text?.trim()||r.text.length>4000)return '변화를 1~4,000자로 기록해 주세요.';if(!r.date||r.date>day())return '오늘 또는 이전 날짜를 선택해 주세요.';if(r.values&&weighted(r.axis,r.values)==null)return '측정 항목을 모두 선택해 주세요.';if(records.some(x=>!x.archived&&x.date===r.date&&x.axis===r.axis&&x.text.trim()===r.text.trim()))return '같은 날짜에 동일한 기록이 이미 있습니다.';if(r.metrics&&(!Number.isFinite(r.metrics.reach)||r.metrics.reach<1||!Number.isFinite(r.metrics.days)||r.metrics.days<1))return '영향을 받은 대상 수와 유지 기간을 입력해 주세요.';return null;}

const SETCOUNTER_ORIGIN = 'https://setcounter.onrender.com';

// Import source facts only. Training volume or app XP cannot establish all four Body dimensions.
function importWorkouts(payload, existing, now = new Date()) {
  if (!payload || !Number.isSafeInteger(payload.profile?.id) || !Array.isArray(payload.logs) || payload.logs.length > 10000) throw Error('SetCounter 응답 형식이 올바르지 않습니다.');
  const account = String(payload.profile.id), today = now.toISOString().slice(0,10);
  const ids = new Set();
  const records = payload.logs.map(log => {
    if (!Number.isSafeInteger(log.id) || log.id < 1 || ids.has(log.id) || typeof log.exercise !== 'string' || !log.exercise.trim() || log.exercise.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(log.date) || !Number.isFinite(Date.parse(log.date)) || new Date(log.date).toISOString().slice(0,10) !== log.date || log.date > today || !Array.isArray(log.setRows) || !log.setRows.length || log.setRows.length > 1000) throw Error('가져올 운동 기록에 잘못된 값이 있습니다.');
    ids.add(log.id);
    const sets = log.setRows.map(s => {
      if (!Number.isFinite(s.weightKg) || s.weightKg < 0 || s.weightKg > 2000 || !Number.isSafeInteger(s.reps) || s.reps < 0 || s.reps > 10000) throw Error('중량 또는 횟수가 올바르지 않습니다.');
      return {weightKg:s.weightKg,reps:s.reps};
    });
    const id = `setcounter:${account}:${log.id}`;
    const prior = existing.find(r => r.id === id);
    return {id, date:log.date, axis:'body', level:1, values:null, sample:false,
      text:`SetCounter · ${log.exercise}\n${sets.map((s,i)=>`${i+1}세트: ${s.weightKg}kg × ${s.reps}회`).join('\n')}`.slice(0,4000),
      source:{provider:'setcounter',account,workoutId:log.id,exercise:log.exercise,sets},
      archived:prior?.archived || false};
  });
  // Replace this account's snapshot so edits/deletions are reflected without inflating evidence.
  return {records:[...existing.filter(r => !(r.source?.provider === 'setcounter' && r.source.account === account)),...records],
    connection:{account,nickname:String(payload.profile.nickname || 'SetCounter 계정').slice(0,40),level:Number.isFinite(payload.profile.level)?payload.profile.level:null,syncedAt:now.toISOString(),count:records.length}};
}

function workoutSummary(records) {
  const logs = records.filter(r => r.source?.provider === 'setcounter' && !r.archived && Array.isArray(r.source.sets) && r.source.sets.every(s=>Number.isFinite(s.weightKg)&&s.weightKg>=0&&Number.isFinite(s.reps)&&s.reps>=0));
  return {count:logs.length,days:new Set(logs.map(r=>r.date)).size,
    sets:logs.reduce((n,r)=>n+r.source.sets.length,0),
    volume:logs.reduce((n,r)=>n+r.source.sets.reduce((v,s)=>v+s.weightKg*s.reps,0),0)};
}

const hostedWithSetcounter = typeof location !== 'undefined' && location.origin === SETCOUNTER_ORIGIN;

async function readOwnWorkouts(fetcher = fetch, paired = false) {
  // An anonymous browser key is not the user's signed-in workout account.
  const headers = {};
  async function read(path) {
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),8000);
    let response;
    try {
      response = await fetcher(path, {headers, credentials:'same-origin', cache:'no-store', signal:controller.signal});
    } catch {
      throw Error('연결이 지연되고 있습니다. 앱은 사용할 수 있으며 운동 기록은 자동으로 다시 가져옵니다.');
    } finally { clearTimeout(timer); }
    if (!response.ok) {
      const error = Error(response.status === 401 ? 'SetCounter 로그인이 필요합니다.' : '운동 기록을 불러오지 못했습니다. 잠시 후 다시 연결합니다.');
      error.status=response.status; throw error;
    }
    return response.json();
  }
  if (paired === true) return read('/influence-api/workouts');
  const auth = await read('/api/auth/status');
  if (auth.authenticated !== true || auth.accountLinked !== true) {
    const error = Error('계정 연결 대기 · SetCounter의 운동 기록이 있는 계정으로 로그인해야 합니다. 기기의 임시 계정은 연결하지 않습니다.');
    error.status=401;throw error;
  }
  const before = await read('/api/profile');
  const logs = await read('/api/logs');
  const after = await read('/api/profile');
  if (!Number.isSafeInteger(before.id) || before.id !== after.id) throw Error('계정이 변경되어 기록을 다시 확인합니다.');
  return {profile:after,logs};
}

function connectionToken(value) {
  let url;
  try { url = new URL(String(value).trim()); } catch { throw Error('전용 연결 주소 전체를 붙여넣어 주세요.'); }
  const token = new URLSearchParams(url.hash.slice(1)).get('connect');
  if (url.origin !== SETCOUNTER_ORIGIN || url.pathname !== '/static/influence/index.html' || !token || token.length > 2048 || !/^[A-Za-z0-9_.-]+$/.test(token)) {
    throw Error('SetCounter 전용 연결 주소가 아닙니다. #connect= 부분까지 복사해 주세요.');
  }
  return token;
}

async function claimDeviceLink(value) {
  if (!hostedWithSetcounter) return;
  const token = value ? connectionToken(value) : new URLSearchParams(location.hash.slice(1)).get('connect');
  if (!token) return;
  const response = await fetch('/influence-api/claim', {method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
  if (!response.ok) throw Error('연결 주소가 만료됐거나 올바르지 않습니다.');
  localStorage.setItem('influence.paired','1');
  history.replaceState(null,'',location.pathname+location.search);
}

async function disconnectDevice() {
  if (!hostedWithSetcounter) return;
  const response=await fetch('/influence-api/disconnect',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});
  if(!response.ok)throw Error('연결 해제를 완료하지 못했습니다.');
  localStorage.removeItem('influence.paired');
}

function onboardingStart(){close();onboarding={step:-1,records:[]};onboardingRender();}
function onboardingRender(){const step=onboarding.step;const prompts=['최근에 몸으로 해낸 것은 무엇인가요?','최근 해결한 가장 어려운 문제는 무엇인가요?','최근 중요한 약속을 어떻게 이행했나요?','실제로 완성한 결과물은 무엇인가요?','지속적으로 무엇을 유지하고 있나요?'];if(step<0){modal(`${head('첫 번째 측정')}<div class="welcome"><img src="./exert-influence-icon.svg" alt=""><div class="eyebrow">INITIAL CALIBRATION</div><h2 style="margin-top:16px">당신의 현재 위치를<br>측정합니다.</h2><p>돈, 직업명, 소유물은 평가하지 않습니다.<br>실제로 무엇을 할 수 있고,<br>무엇을 만들며, 무엇을 움직이는지 봅니다.</p></div><form id="onboard-name"><div class="field"><label for="display-name">어떻게 부르면 좋을까요?</label><input id="display-name" name="name" required maxlength="30" value="${mode==='real'&&real.name!=='나의 기록'?esc(real.name):''}" placeholder="이름 또는 별명"></div><div class="modal-actions"><button class="btn primary full">측정 시작 ${icon('arrow')}</button></div></form>`);return;}
if(step===5){$('#modal').innerHTML=`${head('현실에 만든 변화.','생산과 영향은 다릅니다. 다른 사람이나 시스템에 실제로 생긴 변화를 기록해 주세요.')}<form id="onboard-impact" style="margin-top:24px"><div class="field"><label for="impact-text">실제로 달라진 것</label><textarea id="impact-text" name="text" required placeholder="누가, 어떻게 달라졌나요?"></textarea></div><div class="form-grid"><div class="field"><label for="initial-reach">실제 변화 대상 수</label><input id="initial-reach" name="reach" type="number" min="1" required></div><div class="field"><label for="initial-days">변화 유지 기간 (일)</label><input id="initial-days" name="days" type="number" min="1" required></div></div><div class="help-box">초기 기록은 E0 자기진술로 보관됩니다. 추후 증거를 더해 교정할 수 있습니다.</div><div class="modal-actions"><button type="button" class="btn" data-action="onboard-finish">아직 미측정</button><button class="btn primary">초기 측정 마치기</button></div></form>`;return;}
const a=axes[step];$('#modal').innerHTML=`${head(names[a]+'의 현재 위치')}<div class="onboard-progress">${Array.from({length:6},(_,i)=>`<i class="${i<=step?'done':''}"></i>`).join('')}</div><p style="margin-bottom:22px">${prompts[step]}</p><form id="onboard-axis"><div class="field"><label for="onboard-text">실제 사례 · 수행 기록</label><textarea id="onboard-text" name="text" required minlength="10" maxlength="4000" placeholder="언제, 어떤 상황에서, 무엇을 해냈는지 적어 주세요."></textarea></div>${rubrics(a)}<div class="help-box">처음에는 낮은 신뢰도의 잠정 추정치입니다. 기록이 없으면 미측정으로 넘어가도 됩니다.</div><div class="modal-actions"><button type="button" class="btn" data-action="onboard-skip">미측정으로 넘어가기</button><button class="btn primary">다음 ${icon('arrow')}</button></div></form>`;$('#modal').scrollTop=0;}
function finishOnboarding(){const old=structuredClone(real);mode='real';real.name=onboarding.name;real.onboarded=true;real.records.push(...onboarding.records);try{save();}catch(e){real=old;toast(e.message);return;}const m=compute(real);$('#modal').innerHTML=`<div class="celebration"><span class="eyebrow">INITIAL CALIBRATION</span><div class="rule"></div><h2>${m.rank?'RANK '+roman[m.rank]:'측정의 시작'}</h2><p>새로운 상태를 계산했습니다.</p><p class="lead">${onboarding.records.length}개의 초기 기록이 저장되었습니다.<br>앞으로 7일 동안 실제 행동과 결과를 관찰합니다.</p><div class="rule"></div><button class="btn primary full" data-action="finish">내 상태 보기 ${icon('arrow')}</button></div>`;render();}
function download(content,name,type='application/json'){const a=document.createElement('a');const u=URL.createObjectURL(new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function validBackup(d){if(d?.version!==1||typeof d.name!=='string'||d.name.length>100||!Array.isArray(d.records)||!Array.isArray(d.campaigns)||!Array.isArray(d.commitments)||d.records.length>10000)return false;return d.records.every(r=>typeof r.id==='string'&&typeof r.text==='string'&&r.text.length<=4000&&[...axes,'impact','action','adoption'].includes(r.axis)&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&(!r.values||(axes.includes(r.axis)&&weighted(r.axis,r.values)!==null))&&(!r.url||/^https?:\/\//i.test(r.url))&&(!r.metrics||[r.metrics.reach,r.metrics.depth,r.metrics.days,r.metrics.attribution].every(Number.isFinite))&&(!r.attachment||(typeof r.attachment.name==='string'&&/^data:(image\/(png|jpeg|webp|gif)|application\/pdf|text\/plain);base64,/i.test(r.attachment.data))))&&d.campaigns.every(c=>typeof c.id==='string'&&typeof c.title==='string'&&typeof c.condition==='string'&&[...axes,'impact'].includes(c.axis)&&['active','submitted','ended'].includes(c.status)&&/^\d{4}-\d{2}-\d{2}$/.test(c.started)&&/^\d{4}-\d{2}-\d{2}$/.test(c.deadline))&&d.commitments.every(c=>typeof c.date==='string'&&typeof c.text==='string'&&typeof c.status==='string');}
async function importBackup(){const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=async()=>{try{const f=input.files[0];if(!f)return;if(f.size>10000000)throw Error('백업은 10MB 이하만 가져올 수 있습니다.');const incoming=JSON.parse(await f.text());if(!validBackup(incoming))throw Error('지원하는 Exert Influence 백업 형식이 아닙니다.');const backup=structuredClone(real);incoming.records.forEach(r=>{if(!real.records.some(x=>x.id===r.id))real.records.push({...r,level:Math.min(1,r.level??0),sample:false});});incoming.campaigns.forEach(c=>{if(!real.campaigns.some(x=>x.id===c.id))real.campaigns.push(c);});incoming.commitments.forEach(c=>{if(!real.commitments.some(x=>x.date===c.date))real.commitments.push(c);});real.name=incoming.name;real.onboarded=true;mode='real';try{save();}catch(e){real=backup;throw e;}render();toast('기존 기록을 유지하며 백업을 병합했습니다.');}catch(e){toast(e.message);}};input.click();}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;try{
 if(b.dataset.view){view=b.dataset.view;render();window.scrollTo(0,0);return;}
 if(b.dataset.period){windowName=b.dataset.period;render();return;}
 if(b.dataset.filter){filter=b.dataset.filter;render();return;}
 if(b.dataset.stat){statDetail(b.dataset.stat);return;}
 if(b.dataset.measure){close();recordModal(b.dataset.measure);return;}
 if(b.dataset.campaign){campaignDetail(b.dataset.campaign);return;}
 if(b.dataset.record){if($('#modal').open)close();recordDetail(b.dataset.record);return;}
 if(b.dataset.download){const r=data().records.find(r=>r.id===b.dataset.download);const a=document.createElement('a');a.href=r.attachment.data;a.download=r.attachment.name;a.click();return;}
 if(b.dataset.daily){const status=b.dataset.daily;modal(`${head('오늘의 약속 · '+status)}<form id="daily-result" data-status="${status}"><div class="field" style="margin-top:20px"><label for="reason">결과와 이유</label><textarea id="reason" name="reason" required placeholder="어떤 결과가 있었나요? 변경·실패했다면 원인을 구분해 주세요."></textarea></div><div class="field"><label for="cause">원인</label><select id="cause" name="cause"><option>해당 없음</option><option>능력 부족</option><option>스스로 중단</option><option>외부조건 변경</option><option>계획 범위 변경</option></select></div><button class="btn primary full">결과 기록</button></form>`);return;}
 const action=b.dataset.action;
 if(action==='recover-device'){deviceRecoveryModal();return;}
 if(action==='setcounter'){if(hostedWithSetcounter){real.setcounterPaused=false;await autoSyncSetcounter(true);}else connectSetcounter();return;}
 if(action==='setcounter-remove'){await disconnectDevice();const old=structuredClone(real),oldMode=mode;mode='real';real.records=real.records.filter(r=>r.source?.provider!=='setcounter');delete real.setcounter;if(hostedWithSetcounter)real.setcounterPaused=true;try{save();}catch(e){real=old;mode=oldMode;throw e;}close();render();return;}
 if(action==='close'){close();return;}
 if(action==='switch'){if(mode==='demo'){mode='real';if(!real.onboarded&&!real.records.length){onboardingStart();}render();}else{mode='demo';render();}return;}
 if(action==='record'){close();recordModal();return;}
 if(action==='diagnosis'){diagnosis();return;}
 if(action==='new-campaign'){newCampaign();return;}
 if(action==='measure-bottleneck'){const a=compute(data()).bottleneck;close();recordModal(a);return;}
 if(action==='rank'){rankModal();return;}
 if(action==='model'){modelModal();return;}
 if(action==='onboard'){onboardingStart();return;}
 if(action==='onboard-skip'){onboarding.step++;onboardingRender();return;}
 if(action==='onboard-finish'){finishOnboarding();return;}
 if(action==='finish'){close();view='status';render();return;}
 if(action==='name'){modal(`${head('표시 이름 수정')}<form id="name-form" style="margin-top:22px"><div class="field"><label for="new-name">이름</label><input id="new-name" name="name" value="${esc(data().name)}" maxlength="30" required></div><button class="btn primary full">저장</button></form>`);return;}
 if(action==='export'){download(JSON.stringify(data(),null,2),`sovereign-${mode}-${day()}.json`);toast('백업 파일을 내보냈습니다.');return;}
 if(action==='import'){await importBackup();return;}
 if(action==='archive-record'){const r=data().records.find(r=>r.id===b.dataset.id);r.archived=true;save();close();render();toast('보관함으로 이동했습니다. 프로필에서 복원할 수 있습니다.');return;}
 if(action==='archive'){modal(`${head('보관된 기록')}<p class="lead">보관된 기록은 현재 점수에서 제외됩니다.</p>${data().records.filter(r=>r.archived).map(r=>`<div class="settings-row"><p>${esc(r.text.slice(0,60))}</p><button class="btn" data-action="restore" data-id="${r.id}">복원</button></div>`).join('')||'<div class="empty">보관된 기록이 없습니다.</div>'}`);return;}
 if(action==='restore'){data().records.find(r=>r.id===b.dataset.id).archived=false;save();close();render();toast('기록을 복원했습니다.');return;}
 if(action==='campaign-record'){const id=b.dataset.id;close();recordModal();draft.campaign=id;return;}
 if(action==='campaign-submit'){const c=data().campaigns.find(c=>c.id===b.dataset.id);if(!data().records.some(r=>!r.archived&&r.campaign===c.id&&(r.url||r.attachment))){toast('증거 URL 또는 파일이 있는 기록을 먼저 연결해 주세요.');return;}c.status='submitted';save();close();render();toast('결과를 제출했습니다. 외부 검증 대기 상태입니다.');return;}
 if(action==='campaign-stop'){const id=b.dataset.id;close();modal(`${head('캠페인의 결과를 남깁니다.')}<form id="campaign-end" data-id="${id}" style="margin-top:20px"><div class="field"><label for="end-reason">변경 또는 종료 이유</label><textarea id="end-reason" name="reason" required minlength="5" placeholder="능력 부족, 외부조건 변경, 범위 변경 등"></textarea></div><div class="help-box">실패 자체로 점수를 차감하지 않습니다. 다음 진단에 필요한 맥락을 남깁니다.</div><button class="btn primary full">기록하고 종료</button></form>`);return;}
 if(action==='daily'){modal(`${head('오늘 반드시 끝낼 한 가지')}<form id="daily-form" style="margin-top:22px"><div class="field"><label for="daily-text">행동 전에 등록하는 중요한 약속</label><textarea id="daily-text" name="text" required minlength="5" maxlength="1000" placeholder="오늘 끝낼 결과와 성공조건을 적어 주세요."></textarea></div><div class="help-box">하루에 하나만 등록합니다. 결과는 완료·변경·실패로 남길 수 있습니다.</div><button class="btn primary full">오늘의 약속 등록</button></form>`);return;}
 }catch(err){toast(err.message);}});
document.addEventListener('input',e=>{if(e.target.id==='search'){search=e.target.value;$('#record-list').innerHTML=filteredRecords();}});
document.addEventListener('change',e=>{if(e.target.id==='axis'){draft.axis=e.target.value;draft.url=$('#evidence-url').value;draft.measure=false;draft.values=null;recordReview();$('#rubric-area')?.querySelectorAll('select').forEach(s=>s.required=false);}if(e.target.id==='measure'){draft.measure=e.target.checked;$('#rubric-area').hidden=!draft.measure;$('#rubric-area').querySelectorAll('select').forEach(s=>s.required=draft.measure);}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,fd=new FormData(f),v=n=>fd.get(n);try{
 if(f.id==='recover-device-form'){const button=f.querySelector('button[type=submit]');button.disabled=true;try{await claimDeviceLink(v('link'));await autoSyncSetcounter(true);if(!autoNeedsLogin)close();}finally{button.disabled=false;}return;}
 if(f.id==='record-first'){draft.text=v('text').trim();draft.date=v('date');draft.axis=draft.axis||classify(draft.text);recordReview();$('#rubric-area')?.querySelectorAll('select').forEach(s=>s.required=false);return;}
 if(f.id==='record-save'){let attachment=draft.attachment;const file=v('file');if(file?.size){if(file.size>2*1024*1024)throw Error('첨부 파일은 2MB 이하로 선택해 주세요.');const content=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});attachment={name:file.name,data:content};}const a=draft.axis;const r={id:uid(),text:draft.text,date:draft.date,axis:a,level:1,url:v('url')?.trim()||'',attachment,campaign:v('campaign')||'',values:axes.includes(a)&&v('measure')?subaxes[a].map((_,i)=>Number(v('v'+i))):null,metrics:a==='impact'?{reach:Number(v('reach')),days:Number(v('days')),depth:Number(v('depth')),attribution:Number(v('attribution'))}:null};if(r.url&&!/^https?:\/\//i.test(r.url))throw Error('증거 URL은 http 또는 https 주소여야 합니다.');const error=validateRecord(r,data().records);if(error)throw Error(error);data().records.push(r);try{save();}catch(e){data().records.pop();throw e;}close();render();toast(mode==='demo'?'예시 공간에 저장했습니다. 내 기록에는 반영되지 않습니다.':'변화와 근거를 저장했습니다.');return;}
 if(f.id==='campaign-form'){const condition=v('condition').trim();if(condition.length<15||/^(작업하기|운동하기|공부하기|개발하기)$/.test(condition))throw Error('다른 사람이 확인할 수 있는 구체적인 성공조건을 적어 주세요.');if(v('deadline')<day())throw Error('목표 날짜는 오늘 이후여야 합니다.');const m=compute(data());data().campaigns.push({id:uid(),title:v('title').trim(),kind:v('kind'),axis:v('axis'),condition,started:day(),deadline:v('deadline'),status:'active',baseline:m.stats[v('axis')]?.mu??null});save();close();view='campaign';render();toast('새 캠페인을 시작했습니다.');return;}
 if(f.id==='name-form'){data().name=v('name').trim()||'나의 기록';save();close();render();return;}
 if(f.id==='onboard-name'){onboarding.name=v('name').trim();onboarding.step=0;onboardingRender();return;}
 if(f.id==='onboard-axis'){const a=axes[onboarding.step];onboarding.records.push({id:uid(),text:v('text').trim(),date:day(),axis:a,level:0,values:subaxes[a].map((_,i)=>Number(v('v'+i)))});onboarding.step++;onboardingRender();return;}
 if(f.id==='onboard-impact'){onboarding.records.push({id:uid(),text:v('text').trim(),date:day(),axis:'impact',level:0,metrics:{reach:Number(v('reach')),days:Number(v('days')),depth:.6,attribution:.2}});finishOnboarding();return;}
 if(f.id==='daily-form'){if(data().commitments.some(c=>c.date===day()))throw Error('오늘의 약속은 이미 등록되어 있습니다.');data().commitments.push({date:day(),text:v('text').trim(),status:'pending',createdAt:new Date().toISOString()});save();close();render();toast('행동 전 약속을 등록했습니다.');return;}
 if(f.id==='daily-result'){const c=data().commitments.find(c=>c.date===day());c.status=f.dataset.status;c.reason=v('reason');c.cause=v('cause');c.resolvedAt=new Date().toISOString();data().records.push({id:uid(),text:`[${c.status}] ${c.text}\n${c.reason} · ${c.cause}`,axis:'control',date:day(),level:1});save();close();render();toast('약속의 결과를 기록했습니다.');return;}
 if(f.id==='campaign-end'){const c=data().campaigns.find(c=>c.id===f.dataset.id);c.status='ended';c.reason=v('reason');data().records.push({id:uid(),text:`캠페인 종료: ${c.title}\n${c.reason}`,axis:'action',date:day(),level:1,campaign:c.id});save();close();render();toast('종료 이유를 남겼습니다.');return;}
 }catch(err){const error=$('#form-error');if(error)error.textContent=err.message;else toast(err.message);}});
queueMicrotask(()=>{if(hostedWithSetcounter)mode='real';render();if(hostedWithSetcounter)void autoSyncSetcounter();$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});});
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={status:'M3 17V9m6 8V4m6 13v-6m6 6V2',campaign:'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6',records:'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',profile:'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',arrow:'M4 12h16m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14',shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6zM8 12l3 3 5-6',chart:'M3 19h18M4 14l5-5 5 3 6-8',link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2'};
const icon=n=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[n]||icons.status}"/></svg>`;
const number=(v,d=1)=>v==null?'—':v.toFixed(d),dateLabel=s=>s.replaceAll('-','.'),uid=()=>{if(typeof crypto.randomUUID==='function')return crypto.randomUUID();const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;return Array.from(bytes,(b,i)=>([4,6,8,10].includes(i)?'-':'')+b.toString(16).padStart(2,'0')).join('');};
let storageKey='sovereign.v1';const fresh=()=>({version:1,name:'나의 기록',created:day(),records:[],campaigns:[],commitments:[]});
let real;try{real=JSON.parse(localStorage.getItem(storageKey))||fresh();if(real.version!==1||!Array.isArray(real.records))real=fresh();}catch{real=fresh();}
const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toLocaleDateString('sv-SE');};
function demoData(){let d=fresh();d.name='EXPLORER';d.created=ago(95);const scores={body:[78,70,68,70],ability:[85,82,86,80],control:[55,66,58,65],production:[80,78,75,85,65],responsibility:[70,72,78,74]};const texts={body:'벤치프레스 90kg × 5회 · 최근 수행능력 측정',ability:'복잡한 데이터 파이프라인을 독립적으로 설계하고 해결',control:'중요 약속 이행과 이탈 후 복구 기록',production:'SetCounter V2 로그인 시스템 구현 및 테스트 완료',responsibility:'서비스 유지보수와 사용자 지원 의무를 안정적으로 수행'};
axes.forEach((a,i)=>[65,28,3+i].forEach((n,k)=>d.records.push({id:uid(),text:texts[a],axis:a,date:ago(n),level:3,values:scores[a].map(v=>v-k*.5),source:'예시 외부 검증',url:'',sample:true})));
[80,45,8].forEach(n=>d.records.push({id:uid(),text:'SetCounter — 반복 사용자 188명, 운동 기록 행동 변화 확인',axis:'impact',date:ago(n),level:3,metrics:{reach:188,depth:.8,days:180,attribution:.85},sample:true}));
d.campaigns=[{id:'sample-campaign',title:'SetCounter V2 배포',condition:'외부 사용자가 배포된 V2에서 가입하고 운동 기록을 저장할 수 있다.',axis:'control',kind:'돌파',started:ago(8),deadline:ago(-6),status:'active',baseline:60,target:66}];d.records.find(r=>r.axis==='production').campaign='sample-campaign';return d;}
let demo=demoData(),mode=real.records.length||real.onboarded?'real':'demo',view='status',windowName='form',filter='all',search='',draft=null,onboarding=null;
const data=()=>mode==='demo'?demo:real;
function save(){if(mode==='real'){try{localStorage.setItem(storageKey,JSON.stringify(real));}catch{throw Error('저장 공간이 부족합니다. 첨부 파일 크기를 줄여 주세요.');}}}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function modal(html){$('#modal').innerHTML=html;$('#modal').showModal();$('#modal').scrollTop=0;}
const close=()=>$('#modal').close();
function head(title,sub=''){return `<div class="modal-head"><h2>${title}</h2><button class="close" data-action="close" aria-label="닫기">×</button></div>${sub?`<p class="lead">${sub}</p>`:''}`;}
const option=(v,l,s)=>`<option value="${v}" ${String(v)===String(s)?'selected':''}>${l}</option>`;
function nav(){return `<aside class="sidebar"><div class="brand"><img src="./exert-influence-icon.svg" alt=""><span>EXERT INFLUENCE</span></div><div class="brand-sub">TURN POTENTIAL INTO IMPACT</div><nav class="nav" aria-label="주 메뉴">${[['status','상태'],['campaign','캠페인'],['records','기록'],['profile','프로필']].map(([id,label])=>`<button data-view="${id}" class="${view===id?'active':''}" ${view===id?'aria-current="page"':''}>${icon(id)}<span>${label}</span></button>`).join('')}</nav><div class="sidebar-foot"><div class="side-note"><span class="eyebrow">BUILT ON EVIDENCE</span><p style="margin-top:9px">당신의 변화는<br>현실에서 증명됩니다.</p></div><button class="row profile-small" data-view="profile"><span class="avatar">${mode==='demo'?'E':esc(data().name.slice(0,1))}</span><span><strong>${esc(data().name)}</strong><small>${mode==='demo'?'예시 프로필':'이 기기에 저장됨'}</small></span></button></div></aside>`;}
function render(){const m=compute(data(),windowName);$('#app').innerHTML=`${nav()}<div class="shell"><header class="topbar"><div class="mobile-brand"><img src="./exert-influence-icon.svg" alt="">EXERT INFLUENCE</div><div class="path">나의 상황실 <span>/ &nbsp; ${{status:'상태',campaign:'캠페인',records:'기록',profile:'프로필'}[view]}</span></div><div class="row"><span class="connection"><i class="dot"></i>${mode==='demo'?'예시 데이터':'로컬 저장'}</span><button class="btn" style="padding:7px 12px;min-height:32px;font-size:10px" data-action="switch">${mode==='demo'?'내 기록 시작':'예시 둘러보기'}</button></div></header><main class="main fade">${hostedWithSetcounter?autoStatusBanner():''}${view==='status'?statusPage(m):view==='campaign'?campaignPage(m):view==='records'?recordsPage(m):profilePage(m)}<footer class="footer"><span>EXERT INFLUENCE &nbsp; / &nbsp; REALITY IS THE MEASURE.</span><span>PERSONAL STATE ENGINE · V0.1</span></footer></main></div>`;}
function period(){return `<div class="period" aria-label="측정 기간">${[['current','CURRENT · 30일'],['form','FORM · 1년'],['legacy','LEGACY · 전체']].map(([id,l])=>`<button data-period="${id}" class="${windowName===id?'active':''}" aria-pressed="${windowName===id}">${l}</button>`).join('')}</div>`;}
function seal(m){return `<div class="rank-seal"><img src="./exert-influence-icon.svg" alt=""><strong>${roman[m.rank??0]}</strong><span>${m.rank?'RANK':'UNMEASURED'}</span></div>`;}
function hero(m){const val=number(m.influence).split('.');return `<section class="card hero"><div class="row between"><span class="eyebrow">YOUR CURRENT STATE</span><button class="tag gold" data-action="rank">${mode==='demo'?'예시 계급':m.rank?'잠정 계급':'측정 대기'} &nbsp; ↗</button></div><div class="hero-main"><div><div class="label">현실에 휘두를 수 있는 영향력</div><div class="big-number mono">${val[0]}${val[1]?`<span class="decimal">.${val[1]}</span>`:''}</div><div class="number-note">${m.influence==null?'기록이 쌓이면 현재 위치가 드러납니다.':'증거로 추정한 현재의 힘 · 100점 기준'}</div></div>${seal(m)}</div><div class="hero-metrics"><div><small>보유한 힘</small><strong class="mono">${number(m.power)}</strong><em>POWER</em></div><div><small>현실 출력</small><strong class="mono">${number(m.impact)}</strong><em>IMPACT</em></div><div><small>종합 신뢰도</small><strong class="mono">${m.confidence}<span style="font-size:13px">%</span></strong></div></div></section>`;}
function statsCard(m){return `<section class="card stats"><div class="row between card-header"><h2>다섯 가지 힘</h2><span class="eyebrow">SCORE / CONFIDENCE</span></div>${axes.map(a=>`<button class="stat-row ${a===m.bottleneck?'hot':''}" data-stat="${a}"><span class="stat-name">${names[a]}${a===m.bottleneck?' ·':''}<small>${english[a]}</small></span><span class="bar"><i style="width:${m.stats[a]?.mu??0}%"></i></span><strong class="mono">${number(m.stats[a]?.mu,0)}</strong><span class="conf">${m.stats[a]?m.stats[a].confidence+'%':'미측정'}</span></button>`).join('')}<div class="mini-foot">각 능력을 누르면 점수의 근거를 확인할 수 있습니다.</div></section>`;}
function constraint(m){const effect=m.effects.find(e=>e.axis===m.bottleneck);return `<section class="card constraint"><div class="row between"><span class="eyebrow">CURRENT CONSTRAINT</span>${icon('campaign')}</div><h2 class="constraint-title">${m.evidenceBottleneck?'증거 부족':names[m.bottleneck]}<span style="font-size:12px;margin-left:12px;color:var(--muted)">${m.evidenceBottleneck?names[m.bottleneck]:'현재 병목'}</span></h2><p>${m.evidenceBottleneck?(m.bottleneck==='body'&&m.records.some(r=>r.source?.provider==='setcounter')?'운동 기록은 연결됐습니다. 신체 종합평가에는 힘·지속능력·움직임·신체 유지력의 준거 평가가 더 필요합니다.':'현재 상태를 판단할 근거가 충분하지 않습니다. 먼저 실제 수행 기록을 남겨 주세요.'):m.bottleneck==='impact'?'보유한 힘이 현실의 변화로 얼마나 이어지는지 확인하세요. 외부 결과를 만드는 과정에 기회가 있습니다.':'현재 모형에서 이 능력의 개선이 다섯 능력 중 영향력을 가장 크게 변화시킵니다.'}</p><div class="effect"><span>${m.evidenceBottleneck?'권장 다음 단계':'해당 지표 +5 가정'}</span><strong>${m.evidenceBottleneck?'검증':`+${number(effect?.delta)} 영향력`}</strong></div><button class="btn primary full" data-action="diagnosis">병목 보기 ${icon('arrow')}</button></section>`;}
function campaignCard(c){if(!c)return `<section class="card"><div class="row between"><h2>현재 캠페인</h2><span class="eyebrow">CAMPAIGN</span></div><div class="empty">지금 가장 중요한 결과 하나에 집중하세요.<br>당신이 목표를 정하고, 증거가 변화를 보여줍니다.<br><button class="btn" data-action="new-campaign">${icon('plus')} 캠페인 설계</button></div></section>`;const linked=data().records.filter(r=>!r.archived&&r.campaign===c.id);return `<section class="card"><div class="row between card-header"><h2>현재 캠페인</h2><span class="tag green">${c.status==='active'?'진행 중':c.status==='submitted'?'검증 대기':'종료'}</span></div><span class="eyebrow">${esc(c.kind)} · ${names[c.axis]}</span><h3 class="campaign-title">${esc(c.title)}</h3><div class="campaign-meta">${Math.max(1,Math.floor((new Date()-new Date(c.started))/86400000)+1)}일째 &nbsp; / &nbsp; 목표 ${dateLabel(c.deadline)}</div><p class="muted" style="font-size:11px">${esc(c.condition)}</p><div class="steps"><div class="step done"><span class="check">✓</span>목표와 성공조건 정의</div><div class="step ${linked.length?'done':''}"><span class="check">${linked.length?'✓':'·'}</span>결과물 기록 ${linked.length?linked.length+'건 연결':'필요'}</div><div class="step"><span class="check">○</span>${c.status==='submitted'?'성공조건 검증 요청됨':'외부 검증 필요'}</div></div><div class="row between mini-foot"><span>완료 횟수 대신, 증거를 쌓습니다.</span><button class="text-btn" data-campaign="${c.id}">상세 보기 →</button></div></section>`;}
function statusPage(m){const recent=[...data().records].filter(r=>!r.archived).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);return `<div class="page-heading row between"><div><h1>현재의 나를 읽다.</h1><p>당신이 가진 힘, 현실에 만든 변화, 그리고 다음 돌파.</p></div>${period()}</div><div class="dashboard"><div class="left stack">${hero(m)}${statsCard(m)}</div><div class="right stack">${constraint(m)}${campaignCard(data().campaigns.find(c=>c.status==='active'||c.status==='submitted'))}</div><section class="card wide"><div class="row between card-header"><h2>최근의 변화</h2><button class="text-btn" data-view="records">전체 기록 보기 ↗</button></div><div class="timeline-preview">${recent.length?recent.map(r=>`<div class="event-preview"><div class="date mono">${dateLabel(r.date)}</div><p>${esc(r.text)}</p><div class="row"><span class="tag">${names[r.axis]}</span><span class="eyebrow">E${r.level??0} · ${r.sample?'예시 증거':r.source?.provider==='setcounter'?'SetCounter · 자가 기록':'자가 기록'}</span></div></div>`).join(''):'<div class="empty">아직 기록된 변화가 없습니다.</div>'}</div></section></div>`;}
function effects(m){return m.effects.map(e=>`<div class="effect-row"><span>${names[e.axis]} +5</span><div class="bar"><i style="width:${Math.max(2,(e.delta??0)/Math.max(.1,...m.effects.map(x=>x.delta??0))*100)}%"></i></div><strong>${e.delta==null?'미측정':'+'+number(e.delta,2)}</strong></div>`).join('');}
function campaignPage(m){return `<div class="section-top"><div><span class="eyebrow">FOCUS ON THE CONSTRAINT</span><h1 style="margin-top:10px">한 번에, 하나의 돌파.</h1></div><button class="btn primary" data-action="new-campaign">${icon('plus')} 캠페인 설계</button></div><div class="section-grid"><div class="stack">${constraint(m)}${data().campaigns.length?data().campaigns.map(c=>campaignCard(c)).join(''):campaignCard(null)}</div><div class="stack"><section class="card"><span class="eyebrow">SENSITIVITY ANALYSIS</span><h2 style="margin-top:12px">어디를 바꾸면 달라질까?</h2><p class="lead">각 지표를 5점 개선했을 때의 모형상 변화입니다. 실제 효과를 보장하는 예측은 아닙니다.</p>${effects(m)}<div class="mini-foot">다른 값은 고정한 민감도 비교 · V0.1</div></section>${dailyCard()}<section class="card"><h2>측정 → 돌파 → 검증</h2><p class="lead">돌파는 실제 제약을 개선하는 실험입니다. 검증은 그 제약이 맞는지 확인하는 실험입니다. 캠페인 완료 자체로 점수를 부여하지 않습니다.</p></section></div></div>`;}
function dailyCard(){const today=data().commitments.find(c=>c.date===day());return `<section class="card"><div class="row between"><h2>7일 캘리브레이션</h2><span class="tag">${new Set(data().commitments.filter(c=>c.status!=='pending').map(c=>c.date)).size} / 7일</span></div><p class="lead">오늘 반드시 끝낼 한 가지를 행동 전에 등록하세요.</p>${today?`<p style="margin-top:18px">${esc(today.text)}</p><div class="row" style="margin-top:16px">${today.status==='pending'?['완료','변경','실패'].map(s=>`<button class="btn" data-daily="${s}">${s}</button>`).join(''):`<span class="tag">${esc(today.status)}</span><small>${esc(today.reason||'')}</small>`}</div>`:`<button class="btn full" style="margin-top:18px" data-action="daily">오늘의 약속 등록</button>`}<div class="mini-foot">출석 보상 없이, 약속 이행과 복구를 관찰합니다.</div></section>`;}
function recordItems(records){return records.length?records.map(r=>`<article class="timeline-item"><div class="timeline-date mono">${dateLabel(r.date)}<div style="margin-top:9px">E${r.level??0} · ${r.sample?'예시 증거':'자가 기록'}</div></div><div><div class="row between"><span class="tag ${r.axis==='impact'?'green':''}">${names[r.axis]}</span><button class="text-btn" data-record="${r.id}">근거 보기 ↗</button></div><p>${esc(r.text)}</p><div class="row"><small>${r.values?`준거 평가 ${number(weighted(r.axis,r.values))} · 불확실성 반영` :r.metrics?`변화 대상 ${r.metrics.reach} · ${r.metrics.days}일 유지`:'참고 기록 · 점수 변화 없음'}</small>${r.campaign?'<span class="tag">캠페인 연결</span>':''}</div></div></article>`).join(''):`<div class="empty">${icon('records')}<p>아직 해당하는 변화가 없습니다.<br>현실에서 달라진 첫 사건을 남겨 보세요.</p><button class="btn" data-action="record">변화 기록하기</button></div>`;}
function recordsPage(){return `<div class="section-top"><div><span class="eyebrow">EVIDENCE JOURNAL</span><h1 style="margin-top:10px">현실에 남긴 흔적.</h1></div><button class="btn primary" data-action="record">${icon('plus')} 변화 기록</button></div><section class="card"><div class="row between card-header journal-toolbar"><h2>변화의 타임라인</h2><input class="search" id="search" aria-label="기록 검색" placeholder="기록 검색" value="${esc(search)}"></div><div class="filters">${['all',...axes,'impact','action','adoption'].map(a=>`<button data-filter="${a}" class="${filter===a?'active':''}">${a==='all'?'전체':names[a]}</button>`).join('')}</div><div id="record-list">${filteredRecords()}</div></section>`;}
function filteredRecords(){return recordItems([...data().records].filter(r=>!r.archived&&(filter==='all'||r.axis===filter)&&r.text.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date)));}
function profilePage(m){return `<div class="page-heading row between"><div><h1>당신의 캐릭터 시트.</h1><p>숫자에는 근거가, 변화에는 기록이 있습니다.</p></div>${period()}</div><div class="section-grid"><div class="stack">${hero(m)}${statsCard(m)}<section class="card"><h2>현실 영향의 근거</h2>${recordItems(m.records.filter(r=>r.axis==='impact').slice(0,3))}</section></div><div class="stack"><section class="card"><span class="eyebrow">RANK PROGRESSION</span><h2 style="margin-top:12px">증명한 만큼 올라갑니다.</h2><div class="rank-list">${roman.slice(1).map((r,i)=>`<div class="rank-cell ${m.rank===i+1?'current':''}"><small>RANK</small><strong>${r}</strong><small>${i*10}–${i===9?100:i*10+9}</small></div>`).join('')}</div><p class="lead">계급은 보수적 영향력과 다섯 능력의 하한값으로 결정됩니다. VII부터 모든 핵심 능력의 최소 기준이 적용됩니다.</p><button class="text-btn" data-action="rank">계급 조건 확인 →</button></section><section class="card"><h2>모형의 투명성</h2><p class="lead">V0.1은 검증 전의 기획 모형입니다. 모든 추정은 증거와 함께 해석합니다.</p><div class="hero-metrics"><div><small>재현성</small><strong>${number(m.repeatability)}</strong></div><div><small>보수적 영향력</small><strong>${number(m.conservative)}</strong></div><div><small>기록 수</small><strong>${m.records.length}</strong></div></div><button class="btn full" data-action="model">계산 방식과 가정 보기</button></section><section class="card"><h2>프로필 · 데이터</h2>${setcounterCard()}<div class="settings-row"><div><p>${esc(data().name)}</p><small>표시 이름</small></div><button class="btn" data-action="name">수정</button></div><div class="settings-row"><div><p>내 데이터 보관</p><small>이 브라우저에 저장됩니다.</small></div><button class="btn" data-action="export">내보내기</button></div><div class="settings-row"><div><p>기록 복원</p><small>Exert Influence 백업 JSON</small></div><button class="btn" data-action="import">불러오기</button></div><div class="settings-row"><div><p>보관된 기록</p><small>제외한 기록을 다시 복원</small></div><button class="btn" data-action="archive">보기</button></div><div class="settings-row"><div><p>현재 위치 측정</p><small>미측정 영역부터 시작</small></div><button class="btn" data-action="onboard">측정하기</button></div></section></div></div>`;}
function rubrics(axis,values=[]){return `<div class="rubrics">${subaxes[axis].map((label,i)=>`<div class="field"><label for="v${i}">${label} <small>· ${weights[axis][i]*100}%</small></label><select id="v${i}" name="v${i}" required>${option('','선택해 주세요',values[i]??'')}${[[0,'기능 없음'],[20,'기초적인 기능'],[40,'독립적으로 수행'],[60,'높은 실전 능력'],[80,'숙련과 재현성'],[90,'매우 높은 수준'],[100,'준거 상한']].map(([v,l])=>option(v,`${v} · ${l}`,values[i])).join('')}</select></div>`).join('')}</div>`;}
function recordModal(axis=null){draft={axis,text:'',date:day(),url:'',values:null,metrics:null,attachment:null};modal(`${head('무엇이 변했습니까?','현실에서 실제로 달라진 일 하나를 적어 주세요.')}<form id="record-first"><div class="field" style="margin-top:24px"><label for="event-text">변화 기록</label><textarea id="event-text" name="text" required maxlength="4000" placeholder="예: 로그인 시스템을 완성했고 실제 서버에서 작동시켰다."></textarea></div><div class="field"><label for="event-date">발생일</label><input type="date" id="event-date" name="date" max="${day()}" value="${day()}" required></div><div class="help-box">기록을 분류한 다음, 근거와 측정 항목을 확인합니다.</div><div class="modal-actions"><button type="button" class="btn" data-action="close">취소</button><button class="btn primary">분류 확인 ${icon('arrow')}</button></div></form>`);}
function recordReview(){const a=draft.axis;$('#modal').innerHTML=`${head('변화의 근거를 확인하세요.')}<form id="record-save"><div class="analysis-box" style="margin-top:22px"><p style="font-size:12px;margin-bottom:14px">${esc(draft.text)}</p><div class="field"><label for="axis">기록 분류</label><select id="axis" name="axis">${[...axes,'impact','adoption','action'].map(v=>option(v,names[v],a)).join('')}</select><small>로컬 키워드 분류 제안입니다. 실제 의미에 맞게 수정해 주세요.</small></div></div>${axes.includes(a)?`<div class="field"><label class="row"><input type="checkbox" id="measure" name="measure" ${draft.measure?'checked':''}> 실제 수행능력 평가도 남기기</label><small>행동량을 점수로 바꾸지 않습니다. 변화가 확인된 경우에만 준거를 평가하세요.</small></div><div id="rubric-area" ${draft.measure?'':'hidden'}>${rubrics(a,draft.values||[])}</div>`:''}${a==='impact'?`<div class="form-grid"><div class="field"><label for="reach">실제 변화한 대상 수</label><input id="reach" name="reach" type="number" min="1" max="1000000000" required value="${draft.metrics?.reach??''}" placeholder="단순 조회·다운로드 제외"></div><div class="field"><label for="days">변화 유지 기간 (일)</label><input id="days" name="days" type="number" min="1" max="36500" required value="${draft.metrics?.days??''}"></div><div class="field"><label for="depth">변화의 깊이</label><select id="depth" name="depth">${[[.3,'일회성 사용'],[.6,'반복 사용'],[.8,'행동 변화'],[1,'지속적 구조 변화']].map(([v,l])=>option(v,l,draft.metrics?.depth??.6)).join('')}</select></div><div class="field"><label for="attribution">나의 기여에 대한 근거</label><select id="attribution" name="attribution">${[[.2,'관련성만 관찰'],[.5,'구체적 정황 존재'],[.8,'당사자가 기여 확인']].map(([v,l])=>option(v,l,draft.metrics?.attribution??.2)).join('')}</select></div></div>`:''}<div class="field"><label for="evidence-url">증거 URL (선택)</label><input name="url" id="evidence-url" type="url" placeholder="https://..." value="${esc(draft.url)}"><small>링크를 첨부해도 자동 검증되지는 않습니다.</small></div><div class="field"><label for="file">사진 · 파일 (선택, 최대 2MB)</label><input type="file" id="file" name="file" accept="image/*,.pdf,.txt,.md,.csv"><small>${draft.attachment?esc(draft.attachment.name)+' 첨부됨':'파일은 이 브라우저에만 보관됩니다.'}</small></div><div class="field"><label for="campaign-link">캠페인 연결</label><select id="campaign-link" name="campaign"><option value="">연결하지 않음</option>${data().campaigns.filter(c=>c.status==='active').map(c=>option(c.id,esc(c.title),draft.campaign)).join('')}</select></div><div class="help-box">E1 · 자가 기록으로 저장합니다. 독립 검증 전에는 높은 증거 등급을 부여하지 않습니다.</div><p class="form-error" id="form-error"></p><div class="modal-actions"><button type="button" class="btn" data-action="close">취소</button><button class="btn primary">근거와 함께 저장</button></div></form>`;}
function diagnosis(){const m=compute(data(),windowName);modal(`${head('왜 이것이 병목인가?')}<div class="help-box">${m.evidenceBottleneck?`${names[m.bottleneck]}의 측정 근거가 부족합니다. 성장 처방보다 검증이 먼저입니다.`:`모든 값 중 ${names[m.bottleneck]}에 +5를 가정했을 때 모형상 개선 폭이 가장 큽니다.`}</div>${effects(m)}<p class="lead">이 비교는 시간·비용·성공 가능성을 아직 추정하지 않습니다. 캠페인에서 실제 결과를 확인하며 가설을 수정합니다.</p><div class="modal-actions"><button class="btn primary" data-action="${m.evidenceBottleneck?'measure-bottleneck':'new-campaign'}">${m.evidenceBottleneck?'측정 기록 남기기':'돌파 설계하기'} ${icon('arrow')}</button></div>`);}
function newCampaign(){close();modal(`${head('돌파를 설계합니다.','지금 현실에서 만들고 싶은 가장 중요한 결과 하나.')}<form id="campaign-form" style="margin-top:24px"><div class="form-grid"><div class="field"><label for="kind">캠페인 종류</label><select name="kind" id="kind"><option>돌파</option><option>검증</option></select></div><div class="field"><label for="target-axis">대상 영역</label><select name="axis" id="target-axis">${[...axes,'impact'].map(a=>option(a,names[a],compute(data()).bottleneck)).join('')}</select></div></div><div class="field"><label for="campaign-title">중요한 결과</label><input id="campaign-title" name="title" required maxlength="100" placeholder="예: SetCounter V2 배포"></div><div class="field"><label for="condition">검증 가능한 성공조건</label><textarea id="condition" name="condition" required minlength="15" maxlength="1500" placeholder="어떤 결과가 존재하면 성공인가요? 누가, 어디서, 무엇을 확인할 수 있나요?"></textarea><small>‘작업하기’ 대신, 외부에서 확인할 수 있는 완료 상태를 적어 주세요.</small></div><div class="field"><label for="deadline">목표 날짜</label><input type="date" id="deadline" name="deadline" value="${ago(-14)}" min="${day()}" required></div><p class="form-error" id="form-error"></p><div class="modal-actions"><button class="btn primary">캠페인 시작</button></div></form>`);}
function campaignDetail(id){const c=data().campaigns.find(c=>c.id===id);modal(`${head(esc(c.title),esc(c.condition))}<div class="row" style="margin:20px 0"><span class="tag">${esc(c.kind)}</span><span class="tag">${names[c.axis]}</span><small>${dateLabel(c.started)} → ${dateLabel(c.deadline)}</small></div><h3>연결된 증거</h3>${recordItems(data().records.filter(r=>!r.archived&&r.campaign===id))}<div class="help-box">${c.status==='submitted'?'제출되었습니다. 외부 검증 연동 전에는 성공 확정이나 자동 승급이 발생하지 않습니다.':'결과물의 존재와 성공조건 충족을 기록으로 확인하세요. 제출 자체로 점수가 오르지 않습니다.'}</div>${c.status==='active'?`<div class="modal-actions"><button class="btn" data-action="campaign-stop" data-id="${id}">변경 · 종료</button><button class="btn" data-action="campaign-record" data-id="${id}">증거 추가</button><button class="btn primary" data-action="campaign-submit" data-id="${id}">결과 제출</button></div>`:''}`);}
function recordDetail(id){const r=data().records.find(r=>r.id===id);modal(`${head('기록의 근거',dateLabel(r.date))}<p style="margin:20px 0;white-space:pre-wrap">${esc(r.text)}</p><div class="row"><span class="tag">${names[r.axis]}</span><span class="tag">E${r.level??0} · ${r.sample?'예시 검증 데이터':'독립 검증 전'}</span></div>${r.values?`<div style="margin-top:22px">${subaxes[r.axis].map((l,i)=>`<div class="settings-row"><p>${l}</p><strong>${r.values[i]}</strong></div>`).join('')}</div>`:''}${r.metrics?`<div class="help-box">실제 변화 대상 ${r.metrics.reach} · 유지 ${r.metrics.days}일<br>변화 깊이 ${r.metrics.depth} · 귀속률 ${r.metrics.attribution}<br>V0.1 정규화 영향 ${number(impactValue(r.metrics))}</div>`:''}${r.url?`<p style="margin-top:20px"><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">첨부된 증거 열기 ↗</a></p>`:''}${r.attachment?`<button class="btn" style="margin-top:20px" data-download="${id}">첨부 다운로드 · ${esc(r.attachment.name)}</button>`:''}<div class="modal-actions"><button class="btn" data-action="archive-record" data-id="${id}">기록 보관함으로 이동</button></div>`);}
function statDetail(a){const m=compute(data(),windowName),s=m.stats[a],rs=m.records.filter(r=>r.axis===a&&r.values).sort((a,b)=>a.date.localeCompare(b.date));const vals=rs.map(r=>weighted(a,r.values));modal(`${head(names[a]+' · '+english[a])}${a==='body'?setcounterCard():''}<div class="stat-detail-number mono">${number(s?.mu)} <small style="font-size:14px;letter-spacing:0">${s?'신뢰도 '+s.confidence+'%':'미측정'}</small></div>${vals.length>1?`<svg class="chart" viewBox="0 0 500 120" role="img" aria-label="기록별 준거 점수 변화"><path d="M0 110H500M0 60H500M0 10H500" stroke="#323b2b" fill="none"/><polyline points="${vals.map((v,i)=>`${i*500/(vals.length-1)},${110-v}`).join(' ')}" fill="none" stroke="#c9b381" stroke-width="2"/></svg>`:''}<div class="help-box">${s?`보수적 점수 ${number(s.lower)} · 불확실성 ±${number(s.sigma)}<br>기록의 최근성과 증거 수준을 반영한 정밀도 가중 추정입니다.`:'기록이 없는 영역은 0점으로 처리하지 않습니다.'}</div>${a==='body'?'<h3>SetCounter에서 가져온 운동</h3>'+recordItems(m.records.filter(r=>r.source?.provider==='setcounter').slice(-5)):''}<h3>점수를 구성한 기록</h3>${recordItems(rs.slice(-3))}<div class="modal-actions"><button class="btn primary" data-measure="${a}">새 측정 남기기</button></div>`);}
function rankModal(){const m=compute(data());modal(`${head('계급은 증거로 결정됩니다.')}<div class="help-box">현재 보수적 영향력 ${number(m.conservative)} · ${m.rank?'잠정 RANK '+roman[m.rank]:'측정 중'}<br>5개 능력, 현실 영향, 재현성이 모두 측정되어야 계급을 계산합니다.</div>${[7,8,9,10].map(r=>`<div class="settings-row"><p>RANK ${roman[r]}</p><span class="muted">영향력 ≥ ${(r-1)*10} · 모든 능력 하한 ≥ ${(r-3)*10}</span></div>`).join('')}<p class="lead">V0.1 계급은 잠정치입니다. 7일 관찰만으로 독립 검증이 완료되었다고 보지 않습니다. 예시 프로필의 계급도 같은 공식으로 계산합니다.</p>`);}
function modelModal(){modal(`${head('모든 숫자의 출발점.')}<p class="lead">공유 기획의 V1 공식을 구현한 실험 모형입니다.</p><div class="formula" style="margin-top:20px">Power = (B × A × C × P × R)^(1/5)<br>Influence = Power^0.35 × Impact^0.40 × Repeatability^0.25<br>능력 하한 = μ − 0.674σ</div><p class="lead">각 능력은 하위 준거의 가중합입니다. 동일 날짜·내용·영역의 중복 기록은 제외합니다. 기록은 정밀도 가중 평균으로 결합하고, 오래된 근거의 불확실성을 확대합니다. 현재 구현의 신뢰도는 통계적 확률이 아닌 불확실성 표시용 지표입니다.</p><div class="formula" style="margin-top:18px">Impact = 100 × (1 − exp(−log(1+대상수) × 깊이 × (1−exp(−기간/90)) × 귀속률 / 5))</div><p class="lead">영향 점수는 사건별 정규화 값의 평균입니다. 재현성은 영향 사건이 기록된 월 수와 사건 수로 추정하는 임시 규칙입니다. 0 값의 기하평균은 계산상 1로 보정하지만, 미측정은 결측으로 유지합니다.</p><p class="lead">CURRENT는 30일, FORM은 365일, LEGACY는 전체 기록입니다. 계급은 FORM 기준입니다. 기간별 20/65/15 혼합과 비용·성공 확률 기반 병목 추천은 검증할 데이터가 없어 적용하지 않았습니다.</p><div class="help-box">자연어 분류는 로컬 규칙 기반입니다. AI 분석 및 GitHub·센서 자동 검증은 연결 전입니다. URL과 파일 첨부를 독립 검증으로 취급하지 않습니다.</div>`);}

let setcounterPopup=null, setcounterNonce=null, setcounterTimer=null;
function setcounterCard(){const c=real.setcounter, summary=workoutSummary(real.records);return `<div class="help-box"><h3>SetCounter · 운동 기록</h3>${hostedWithSetcounter?`<p role="status">${esc(autoSyncStatus)}</p>`:''}<p>${c?`${esc(c.nickname)} · 레벨 ${c.level??'—'}<br>${summary.days}일 · ${summary.count}개 운동 · ${summary.sets}세트<br>누적 운동량 ${Math.round(summary.volume).toLocaleString()}kg·회<br>마지막 동기화 ${esc(new Date(c.syncedAt).toLocaleString('ko-KR'))}`:'본인 계정의 실제 중량·횟수·날짜를 가져옵니다.'}</p><p>레벨은 참고 정보입니다. 운동 기록만으로 지속능력·움직임·신체 유지력을 알 수 없어 신체 종합점수는 자동 환산하지 않습니다.</p><button class="btn full" data-action="setcounter">${hostedWithSetcounter?(real.setcounterPaused?'자동 연결 다시 켜기':'지금 새로고침'):(c?'최신 운동 기록 동기화':'SetCounter 연결')}</button>${c?'<button class="text-btn" data-action="setcounter-remove">연결 해제 · 가져온 기록 삭제</button>':''}</div>`;}
function connectSetcounter(){
 setcounterNonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 const fragment=new URLSearchParams({origin:location.origin,nonce:setcounterNonce});
 setcounterPopup=window.open(`${SETCOUNTER_ORIGIN}/static/influence-connect.html#${fragment}`,'setcounter-influence');
 if(!setcounterPopup){setcounterNonce=null;toast('팝업을 허용한 뒤 다시 연결해 주세요.');return;}
 close();modal(`${head('SetCounter 연결')}<p class="lead">열린 SetCounter 화면에서 레벨 16 계정인지 확인한 뒤 <b>운동 기록 보내기</b>를 눌러 주세요.</p><p>로그인이 필요하면 그 화면에서 SetCounter를 열어 로그인하고 다시 확인하면 됩니다.</p><p role="status">운동 기록을 기다리고 있습니다. 연결 창이 오류라면 닫고 다시 시도해 주세요.</p><button class="btn full" data-action="close">닫기</button>`);
 clearTimeout(setcounterTimer);setcounterTimer=setTimeout(()=>{setcounterNonce=null;toast('연결 대기 시간이 끝났습니다. 다시 연결해 주세요.');},300000);
}
window.addEventListener('message',event=>{
 if(event.origin!==SETCOUNTER_ORIGIN || event.source!==setcounterPopup || !setcounterNonce || event.data?.nonce!==setcounterNonce || event.data?.type!=='setcounter-workouts')return;
 try{const incoming=event.data;if(real.setcounter && String(incoming.profile?.id)!==real.setcounter.account)throw Error('다른 계정입니다. 기존 연결을 해제한 후 다시 연결해 주세요.');
 const next=importWorkouts(incoming,real.records), old=structuredClone(real),oldMode=mode;
 real.records=next.records;real.setcounter=next.connection;real.onboarded=true;mode='real';
 try{save();}catch(e){real=old;mode=oldMode;throw e;}
 setcounterNonce=null;clearTimeout(setcounterTimer);setcounterPopup.close();close();view='profile';render();toast(`${next.connection.count}개의 실제 운동 기록을 동기화했습니다.`);
 }catch(e){toast(e.message);}
});

let autoNeedsLogin=false,autoSyncBusy=false,autoSyncStatus='운동 기록을 자동으로 연결하고 있습니다.';
async function autoSyncSetcounter(manual=false){
 if(!hostedWithSetcounter||autoSyncBusy)return;
 autoSyncBusy=true;
 try{
  await claimDeviceLink();const payload=await readOwnWorkouts(fetch,localStorage.getItem('influence.paired')==='1');autoNeedsLogin=false;
  const key='sovereign.setcounter.'+payload.profile.id;
  if(storageKey!==key){
   const saved=JSON.parse(localStorage.getItem(key)||'null');
   real=saved&&validBackup(saved)?saved:(real.setcounter?.account===String(payload.profile.id)?real:fresh());
   storageKey=key;mode='real';close();
  }
  if(real.setcounterPaused){autoSyncStatus='자동 연결이 꺼져 있습니다.';return;}
  const next=importWorkouts(payload,real.records),previous=structuredClone(real),previousMode=mode;
  real.records=next.records;real.setcounter=next.connection;real.onboarded=true;mode='real';
  if(real.name==='나의 기록')real.name=next.connection.nickname;
  try{save();}catch(error){real=previous;mode=previousMode;throw error;}
  autoSyncStatus='자동 연결됨 · 앱을 열거나 돌아오면 최신 기록을 가져옵니다.';
  if(manual)toast('최신 운동 기록을 반영했습니다.');
 }catch(error){
  autoSyncStatus=error.message;
  if(error.status===401){autoNeedsLogin=true;real=fresh();mode='real';storageKey='sovereign.signed-out';close();}
  if(manual)toast(error.message);
 }finally{autoSyncBusy=false;render();}
}
if(hostedWithSetcounter){
 setInterval(()=>{if(!document.hidden&&!document.querySelector('#modal').open)autoSyncSetcounter();},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!document.querySelector('#modal').open)autoSyncSetcounter();});
}

function autoStatusBanner(){return `<div class="help-box" role="status">${esc(autoSyncStatus)}${autoNeedsLogin?'<p>Safari와 홈 화면 앱은 연결 정보를 따로 보관할 수 있습니다.</p><button class="btn primary" data-action="recover-device">이 홈 화면 앱에 연결</button><p><a class="text-btn" href="/main">SetCounter 로그인 열기</a></p>':''}</div>`;}

function deviceRecoveryModal(){modal(`${head('이 앱에 운동 계정 연결')}<p class="lead">정상 연결됐던 전용 주소를 붙여넣으면, 지금 실행 중인 홈 화면 앱에 연결이 저장됩니다. 다른 브라우저로 이동하지 않습니다.</p><form id="recover-device-form"><div class="field"><label for="device-link">전용 연결 주소</label><textarea id="device-link" name="link" required maxlength="2600" rows="4" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="https://setcounter.onrender.com/…#connect=…"></textarea></div><p id="form-error" class="form-error" role="alert"></p><button type="submit" class="btn primary full">이 앱에 연결 저장</button></form>`);}

// Follow Safari's visible viewport when its keyboard or browser bars move.
const viewport = window.visualViewport;
function syncViewport() {
  document.documentElement.style.setProperty('--visual-height', `${viewport?.height ?? window.innerHeight}px`);
  document.documentElement.style.setProperty('--visual-top', `${viewport?.offsetTop ?? 0}px`);
}
viewport?.addEventListener('resize', syncViewport, { passive: true });
viewport?.addEventListener('scroll', syncViewport, { passive: true });
window.addEventListener('resize', syncViewport, { passive: true });
syncViewport();

})();

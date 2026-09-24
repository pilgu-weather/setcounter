export const axes=['body','ability','control','production','responsibility'];
export const names={body:'신체',ability:'능력',control:'통제',production:'생산',responsibility:'책임',impact:'현실 영향',action:'행동',adoption:'채택'};
export const english={body:'BODY',ability:'ABILITY',control:'CONTROL',production:'PRODUCTION',responsibility:'RESPONSIBILITY'};
export const weights={body:[.35,.25,.20,.20],ability:[.30,.25,.25,.20],control:[.30,.25,.25,.20],production:[.30,.25,.20,.15,.10],responsibility:[.30,.30,.25,.15]};
export const subaxes={body:['힘','지속능력','움직임','신체 유지력'],ability:['전문성','전이 능력','문제 복잡도','학습 속도'],control:['약속 이행','지속성','방해 극복','복구 속도'],production:['완성 산출물','기능적 품질','제작 난도','완결성','재현성'],responsibility:['책임의 범위','실패의 영향','유지 기간','안정적 유지']};
export const roman=['—','I','II','III','IV','V','VI','VII','VIII','IX','X'];
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
export const day=()=>new Date().toLocaleDateString('sv-SE');
export function weighted(axis,values){if(!values||values.length!==weights[axis]?.length||values.some(v=>!Number.isFinite(v)||v<0||v>100))return null;return values.reduce((s,v,i)=>s+v*weights[axis][i],0);}
export function geometric(values,ws=values.map(()=>1/values.length)){if(values.some(v=>v==null||!Number.isFinite(v)))return null;return Math.exp(values.reduce((s,v,i)=>s+Math.log(Math.max(1,v))*ws[i],0));}
export function posterior(observations,now=new Date()){
 if(!observations.length)return null;
 let precision=0,sum=0;for(const o of observations){const age=Math.max(0,(now-new Date(o.date))/86400000);const tau=[25,20,14,10,6,4][Math.min(o.level??0,5)]*(1+Math.max(0,age-30)/180);const p=1/(tau*tau);precision+=p;sum+=o.value*p;}
 const sigma=Math.sqrt(1/precision);return {mu:sum/precision,sigma,confidence:Math.round(clamp(100*(1-sigma/30),0,99)),lower:clamp(sum/precision-.674*sigma)};
}
export function rankFor(influence,stats){if(influence==null||axes.some(a=>!stats[a]))return null;let rank=Math.min(10,Math.floor(influence/10)+1);const min=Math.min(...axes.map(a=>stats[a].lower));while(rank>=7&&min<(rank-3)*10)rank--;return rank;}
export function classify(text){if(/사용자|행동.*변화|유지율|재사용|절감/.test(text))return 'impact';if(/다운로드|조회|팔로워/.test(text))return 'adoption';if(/벤치|스쿼트|풀업|푸쉬업|달리기|km|체력/.test(text))return 'body';if(/가족|아내|부모|돌봄|반려|의무/.test(text))return 'responsibility';if(/약속|계획|미루|복귀|마감/.test(text))return 'control';if(/완성|배포|출시|구현|제작|문서|작동/.test(text))return 'production';if(/해결|학습|기술|설계|시험/.test(text))return 'ability';return 'action';}
export function impactValue(m){if(!m||!Number.isFinite(m.reach)||m.reach<0)return null;return clamp(100*(1-Math.exp(-Math.log1p(m.reach)*m.depth*(1-Math.exp(-m.days/90))*m.attribution/5)));}
export function compute(data,window='form',now=new Date()){
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
export function validateRecord(r,records){if(!r.text?.trim()||r.text.length>4000)return '변화를 1~4,000자로 기록해 주세요.';if(!r.date||r.date>day())return '오늘 또는 이전 날짜를 선택해 주세요.';if(r.values&&weighted(r.axis,r.values)==null)return '측정 항목을 모두 선택해 주세요.';if(records.some(x=>!x.archived&&x.date===r.date&&x.axis===r.axis&&x.text.trim()===r.text.trim()))return '같은 날짜에 동일한 기록이 이미 있습니다.';if(r.metrics&&(!Number.isFinite(r.metrics.reach)||r.metrics.reach<1||!Number.isFinite(r.metrics.days)||r.metrics.days<1))return '영향을 받은 대상 수와 유지 기간을 입력해 주세요.';return null;}

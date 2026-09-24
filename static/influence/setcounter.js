export const SETCOUNTER_ORIGIN = 'https://setcounter.onrender.com';

// Import source facts only. Training volume or app XP cannot establish all four Body dimensions.
export function importWorkouts(payload, existing, now = new Date()) {
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

export function workoutSummary(records) {
  const logs = records.filter(r => r.source?.provider === 'setcounter' && !r.archived && Array.isArray(r.source.sets) && r.source.sets.every(s=>Number.isFinite(s.weightKg)&&s.weightKg>=0&&Number.isFinite(s.reps)&&s.reps>=0));
  return {count:logs.length,days:new Set(logs.map(r=>r.date)).size,
    sets:logs.reduce((n,r)=>n+r.source.sets.length,0),
    volume:logs.reduce((n,r)=>n+r.source.sets.reduce((v,s)=>v+s.weightKg*s.reps,0),0)};
}

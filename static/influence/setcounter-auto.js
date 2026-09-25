import {SETCOUNTER_ORIGIN} from './setcounter.js';
export const hostedWithSetcounter = typeof location !== 'undefined' && location.origin === SETCOUNTER_ORIGIN;

export async function readOwnWorkouts(fetcher = fetch, paired = false) {
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

export function connectionToken(value) {
  let url;
  try { url = new URL(String(value).trim()); } catch { throw Error('전용 연결 주소 전체를 붙여넣어 주세요.'); }
  const token = new URLSearchParams(url.hash.slice(1)).get('connect');
  if (url.origin !== SETCOUNTER_ORIGIN || url.pathname !== '/static/influence/index.html' || !token || token.length > 2048 || !/^[A-Za-z0-9_.-]+$/.test(token)) {
    throw Error('SetCounter 전용 연결 주소가 아닙니다. #connect= 부분까지 복사해 주세요.');
  }
  return token;
}

export async function claimDeviceLink(value) {
  if (!hostedWithSetcounter) return;
  const token = value ? connectionToken(value) : new URLSearchParams(location.hash.slice(1)).get('connect');
  if (!token) return;
  const response = await fetch('/influence-api/claim', {method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
  if (!response.ok) throw Error('연결 주소가 만료됐거나 올바르지 않습니다.');
  localStorage.setItem('influence.paired','1');
  history.replaceState(null,'',location.pathname+location.search);
}

export async function disconnectDevice() {
  if (!hostedWithSetcounter) return;
  const response=await fetch('/influence-api/disconnect',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});
  if(!response.ok)throw Error('연결 해제를 완료하지 못했습니다.');
  localStorage.removeItem('influence.paired');
}

import {SETCOUNTER_ORIGIN} from './setcounter.js';
export const hostedWithSetcounter = typeof location !== 'undefined' && location.origin === SETCOUNTER_ORIGIN;

export async function readOwnWorkouts(fetcher = fetch) {
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

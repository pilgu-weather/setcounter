import {SETCOUNTER_ORIGIN} from './setcounter.js';
export const hostedWithSetcounter = typeof location !== 'undefined' && location.origin === SETCOUNTER_ORIGIN;

export async function readOwnWorkouts(fetcher = fetch, userKey = null) {
  const headers = userKey ? {'X-User-Key':userKey} : {};
  async function read(path) {
    const response = await fetcher(path, {headers, credentials:'same-origin', cache:'no-store', signal:AbortSignal.timeout(20000)});
    if (!response.ok) {
      const error = Error(response.status === 401 ? 'SetCounter 로그인이 필요합니다.' : '운동 기록을 불러오지 못했습니다. 잠시 후 다시 연결합니다.');
      error.status=response.status; throw error;
    }
    return response.json();
  }
  const before = await read('/api/profile');
  const logs = await read('/api/logs');
  const after = await read('/api/profile');
  if (!Number.isSafeInteger(before.id) || before.id !== after.id) throw Error('계정이 변경되어 기록을 다시 확인합니다.');
  return {profile:after,logs};
}

(async function(){
 const status=document.querySelector('#pair-status'),button=document.querySelector('#pair-create');
 let auth,profile;const key=localStorage.getItem('healthUserKey');
 const headers=key?{'X-User-Key':key}:{};
 async function read(path){const r=await fetch(path,{headers,credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('운동 기록이 있는 SetCounter 계정에서 열어 주세요.');return r.json();}
 try{auth=await read('/api/auth/status');profile=await read('/api/profile');status.textContent=(profile.nickname||'내 계정')+' · 레벨 '+profile.level;button.disabled=false;}catch(e){status.textContent=e.message;}
 button.onclick=async()=>{button.disabled=true;try{
  const r=await fetch('/influence-api/pair',{method:'POST',credentials:'same-origin',headers:{...headers,'Content-Type':'application/json','X-CSRF-Token':auth.csrfToken},body:'{}'});
  if(!r.ok)throw Error('기록이 있는 본인 계정에서만 연결할 수 있습니다.');
  const data=await r.json();
  if(data.nickname!==profile.nickname)throw Error('계정이 변경됐습니다. 다시 확인해 주세요.');
  const link=document.createElement('a');link.href=data.path;link.id='device-link';link.textContent=location.origin+data.path;
  link.style.overflowWrap='anywhere';document.querySelector('#pair-result').replaceChildren(link);
  status.textContent=data.nickname+' · 레벨 '+data.level+' 계정의 전용 연결 주소입니다. 발급 후 24시간 안에 열 수 있습니다.';
 }catch(e){status.textContent=e.message;button.disabled=false;}};
}());

(function () {
  var app = document.getElementById('app');
  var status = document.getElementById('boot-status');
  var timer;
  function fail(message) {
    if (!document.getElementById('boot-status')) return;
    status.textContent = message;
    document.getElementById('boot-retry').hidden = false;
  }
  window.addEventListener('error', function (event) {
    fail('앱 실행을 완료하지 못했습니다. ' + (event.message || '실행 파일을 불러오지 못했습니다.'));
  });
  window.addEventListener('unhandledrejection', function () {
    fail('앱 실행 중 오류가 발생했습니다. 기록은 삭제되지 않았습니다.');
  });
  document.getElementById('boot-retry').onclick = function () { location.reload(); };
  var script = document.createElement('script');
  script.src = document.currentScript.getAttribute('data-bundle');
  script.onerror = function () { fail('앱 파일을 불러오지 못했습니다. 연결을 확인한 뒤 다시 열어 주세요.'); };
  script.onload = function () { clearTimeout(timer); };
  timer = setTimeout(function () { fail('앱 파일 응답이 지연되고 있습니다. 잠시 후 다시 열 수 있습니다.'); }, 12000);
  document.head.appendChild(script);
}());

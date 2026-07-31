# Set Counter 출시 전 점검 보고서

점검일: 2026-07-31
범위: Google Play 출시 준비. Render 배포, 운영 DB 접근, Play Console 실제 제출은 제외.

## 1. 판정

로컬 코드, Android 패키징, 자동 테스트와 기본 모바일 브라우저 회귀 검증은 통과했다. 서명된 Android App Bundle도 생성됐다. 다만 공개 고객지원 이메일, Render 공개 URL, Play App Signing 인증서, 실제 기기 테스트와 Play Console 설문은 소유자 작업이 필요하므로 현재 상태는 **로컬 출시 준비 완료, 외부 제출 대기**다.

## 2. 완료한 작업

- Android targetSdk/compileSdk 36 확인
- TWA 패키지명 `com.setcounter.app` 확인
- 릴리스 난독화와 리소스 축소 확인
- cleartext HTTP 차단, 앱 백업 및 기기 이전 제외
- Android lint의 잘못된 MAIN intent `autoVerify` 오류 수정
- 서명된 릴리스 AAB 생성 및 서명 확인
- 개인정보 처리방침, 이용약관, 계정 삭제 공개 경로 확인
- 건강 앱 선언 답변서 작성
- Play Console 제출 답변서 및 한국어 출시 노트 작성
- 데이터 보안 문서 갱신
- UGC 신고와 별개인 사용자 차단 기능 구현
- 차단 사용자 게시글과 댓글을 서버 응답에서 제외
- 차단 목록 확인 및 해제 UI 구현
- 계정 삭제 시 차단 관계도 함께 삭제
- 모바일 390x844에서 메뉴, 차단 관리 모달, 게시판 빈 상태와 하단 내비게이션 확인

## 3. Android 결과

- AAB: `play-store/private/setcounter-1.0.0.aab`
- 크기: 1,314,975 bytes
- SHA-256: `E4D78E55B3784BCADB49FBA5389BEEE1091253F7A71A96D8A0F099733E477838`
- 빌드: `lintRelease bundleRelease` 성공
- 서명: `jarsigner -verify` 성공
- lint: 오류 0, 경고 2
- 잔여 lint 경고: API 24용 data extraction rule과 minSdk 23 조합, 정사각형 런처 아이콘 형태 권고

## 4. 자동 테스트

- `python -m unittest tests.test_auth -v`: 39개 통과
- Python 문법 검사: 통과
- JavaScript 문법 검사(`app.js`, `motion.js`): 통과
- `git diff --check`: 통과
- UGC 차단 테스트: 게시글·댓글 숨김, 목록 조회, 차단 해제, 자기 자신 차단 거부 통과

## 5. 브라우저 회귀

- 전용 SQLite `release-qa.sqlite3`와 로컬 5058 서버만 사용
- 운영 Neon 및 Render 미접속
- 신규 익명 사용자와 닉네임 저장 확인
- 390x844 가로 오버플로 없음
- 하단 내비게이션 5개 모두 높이 54px
- 메뉴의 차단 사용자 관리 열기와 빈 상태 확인
- 게시판 전환 및 빈 피드 확인
- 콘솔 error/warn 0건
- 검수 서버와 전용 DB는 종료 후 삭제

## 6. 스토어 자산

- 앱 아이콘: 512x512, 유효
- 기능 그래픽: 1024x500, 유효
- 휴대전화 스크린샷: 1080x1920 5장, 형식 유효
- 주의: 스크린샷은 2026-07-22 생성본이라 이후 UI 변경과 차단 관리 기능이 반영된 최신 캡처로 다시 만드는 것이 좋다.

## 7. 보안 및 개인정보

- `.env`, 업로드 키, keystore 설정과 AAB는 Git 제외 상태
- 추적 파일에서 실제 SECRET_KEY, 비밀번호, Discord webhook 토큰 미검출
- 비밀번호는 해시 저장
- 세션 쿠키는 HttpOnly, SameSite=Lax; 운영 Secure 설정 경로 존재
- CSRF는 인증 상태 변경 요청에 적용
- 계정 삭제 공개 경로와 앱 내 삭제 기능 존재
- 새 차단 관계는 개인정보 처리방침과 삭제 범위에 반영

## 8. 제출 전 남은 필수 작업

1. `PUBLIC_SUPPORT_EMAIL`에 실제 공개 고객지원 이메일 설정
2. Render 연결 후 `/main`, `/privacy`, `/terms`, `/account-deletion` HTTPS 응답 확인
3. Play App Signing 인증서 SHA-256을 Digital Asset Links에 반영하고 검증
4. 실제 Android 기기에서 TWA 전체 화면, 알림, 로그인 유지, 뒤로가기, 설치와 업데이트 확인
5. Play Console에서 앱 액세스, 광고, 데이터 보안, 콘텐츠 등급, 건강 앱 선언 제출
6. 신규 개인 개발자 계정 요건이 적용되면 12명 이상 14일 비공개 테스트 수행
7. 최신 UI로 스토어 스크린샷 재촬영
8. 앱에 사용된 자체 제작·생성 이미지의 상업적 사용 근거 보관

## 9. 정책 기준

- 2026-08-31부터 신규 앱과 업데이트의 Android 16(API 36) 타깃 요구사항 확인
- 건강 앱은 건강 앱 선언과 개인정보 처리방침이 필요함을 확인
- 계정 생성 앱은 앱 내부와 외부 웹 경로에서 계정 삭제 요청을 제공해야 함을 확인
- UGC 앱은 신고와 사용자 차단 기능을 제공해야 함을 확인
- 데이터 보안 답변은 실제 수집·공유·보호 방식과 일치해야 함을 확인

관련 공식 링크는 최종 작업 보고의 출처와 `play-store/release-checklist.md`에서 관리한다.

## 10. 배포 상태

- Render 배포: 하지 않음
- 운영 DB 마이그레이션: 하지 않음
- Git push: 하지 않음

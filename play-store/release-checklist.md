# Set Counter Google Play 출시 체크리스트

기준일: 2026-07-31

## 로컬 완료

- [x] applicationId `com.setcounter.app`
- [x] versionCode 1, versionName 1.0.0
- [x] compileSdk/targetSdk 36, minSdk 23
- [x] Trusted Web Activity Android 프로젝트
- [x] 불필요한 민감 권한 미사용
- [x] cleartext HTTP 차단
- [x] 앱 백업 및 기기 이전 제외
- [x] 릴리스 난독화 및 리소스 축소
- [x] 업로드 키와 서명 설정 Git 제외
- [x] 서명된 Android App Bundle 생성
- [x] 개인정보 처리방침, 이용약관, 계정 삭제 경로
- [x] 스토어 한국어 설명과 출시 노트
- [x] 데이터 보안 답변 초안
- [x] 건강 앱 선언 답변 초안
- [x] 앱 액세스·광고·연령·UGC 답변 초안
- [x] 게시글 및 댓글 신고
- [x] 사용자 차단, 목록 확인과 차단 해제
- [x] 차단 사용자 게시글·댓글 서버 필터링
- [x] 스토어 자산 규격 확인
- [x] Android lint와 release bundle 빌드
- [x] Python 및 JavaScript 자동 테스트
- [x] 모바일 390x844 브라우저 회귀 확인

## Render 연결 후

- [x] 공개 고객지원 이메일 확정: `northstarlabshelp@gmail.com`
- [ ] `https://setcounter.onrender.com/main` 정상 응답
- [ ] `/privacy`, `/terms`, `/account-deletion` 비로그인 접근
- [ ] HTTPS 세션 쿠키 Secure 확인
- [ ] `DISCORD_COMPLAINT_WEBHOOK_URL` 설정
- [ ] Render `PUBLIC_SUPPORT_EMAIL=northstarlabshelp@gmail.com` 설정
- [ ] Play App Signing SHA-256을 `ANDROID_SHA256_CERT_FINGERPRINT`에 설정
- [ ] `/.well-known/assetlinks.json` 응답과 Google DAL 검증
- [ ] TWA가 주소 표시줄 없이 실행되는지 실제 기기 확인
- [ ] 운영 DB의 차단 테이블 생성과 건수 확인

## Play Console에서 직접

- [ ] 개발자 계정 신원과 연락처 인증
- [ ] Play App Signing 등록
- [ ] `play-store/private/setcounter-1.0.0.aab` 업로드
- [ ] 앱 액세스: 가입 없이 주요 기능 사용 가능으로 설명
- [ ] 광고 포함 여부: 아니요
- [ ] 데이터 보안 설문 제출
- [ ] 콘텐츠 등급 설문 제출
- [ ] 대상 연령 및 콘텐츠 설정
- [ ] 건강 앱 선언에서 `Activity and Fitness` 선택
- [ ] UGC 신고·차단·운영 정책 경로 확인
- [ ] 대한민국 무료 배포 설정
- [ ] 신규 개인 개발자 계정이면 12명 이상 14일 비공개 테스트
- [ ] 최신 UI 스크린샷 등록
- [ ] 내부 테스트 트랙에서 설치와 업데이트 검증
- [ ] 사전 출시 보고서의 충돌, 접근성, 보안 경고 확인
- [ ] 프로덕션 제출 전 모든 정책 상태 확인

## 생성된 비공개 산출물

- AAB: `play-store/private/setcounter-1.0.0.aab`
- SHA-256: `E4D78E55B3784BCADB49FBA5389BEEE1091253F7A71A96D8A0F099733E477838`
- 업로드 키: `android/upload-key.jks`
- 서명 설정: `android/keystore.properties`
- 복구 정보: `D:\Tools\SetCounterAndroid\private\setcounter-upload-key-recovery.txt`

비공개 파일은 Git에 포함하지 않는다. 업로드 키와 복구 정보는 암호화된 별도 저장소에도 백업한다.

## 공식 정책 링크

- 타깃 API: https://support.google.com/googleplay/android-developer/answer/11926878
- 건강 앱: https://support.google.com/googleplay/android-developer/answer/16679511
- 건강 콘텐츠 및 서비스: https://support.google.com/googleplay/android-developer/answer/14738291
- 데이터 보안: https://support.google.com/googleplay/android-developer/answer/10787469
- 계정 삭제: https://support.google.com/googleplay/android-developer/answer/13327111
- 개인 계정 테스트 요건: https://support.google.com/googleplay/android-developer/answer/14151465
- 스토어 자산: https://support.google.com/googleplay/android-developer/answer/9866151
- 콘텐츠 등급: https://support.google.com/googleplay/android-developer/answer/9859655
- UGC 정책: https://support.google.com/googleplay/android-developer/answer/12923286

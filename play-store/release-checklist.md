# Set Counter Google Play 출시 체크리스트

기준일: 2026-08-12

표시 규칙:

- `[x]` 저장소와 로컬 검증으로 완료
- `[ ]` 배포 또는 Play Console에서 사람이 직접 완료해야 함
- `[!]` 완료 전 출시 불가

## 1. 앱과 서버 코드

- [x] 패키지명 `com.setcounter.app`
- [x] versionCode `1`, versionName `1.0.0`
- [x] compileSdk/targetSdk `36`, minSdk `23`
- [x] Android 16(API 36) 제출 요건 충족
- [x] HTTPS 전용 TWA, cleartext HTTP 차단
- [x] Android 앱 백업과 기기 이전 제외
- [x] Android 권한 최소화: INTERNET, POST_NOTIFICATIONS만 선언
- [x] 운영 HTTPS에서 Secure/HttpOnly/SameSite=Lax 쿠키와 HSTS 적용
- [x] CSP, frame 차단, MIME 스니핑 차단, Referrer/Permissions Policy 적용
- [x] CSRF, 로그인 속도 제한, 비밀번호 해시, 계정 데이터 격리 적용
- [x] 계정 연결 시 기존 HealthUser와 운동 데이터 소유권 유지
- [x] 앱 내부 계정 삭제와 공개 웹 계정 삭제 경로 구현
- [x] 신고, 사용자 차단, 차단 해제, 서버 응답 필터링 구현
- [x] 닉네임 금칙어·사칭·우회 표기 검증 구현
- [x] 민감한 과거 운동 백업 파일을 Git 추적 대상에서 제거
- [x] 새 Python 3.11 환경에서 의존성 설치 성공
- [x] `pip-audit`: 알려진 취약점 0건
- [x] Python 전체 자동 테스트 56개 통과
- [x] Android `lintRelease`: 이슈 0건
- [x] 서명된 release AAB 생성 및 서명 검증 완료

## 2. 약관과 개인정보

- [x] 가입 화면에서 이용약관과 개인정보 처리 동의를 별도 필수 항목으로 받음
- [x] 동의 약관 버전과 동의 시각을 AuthAccount에 기록
- [x] 기존 계정 동의 이력 마이그레이션 완료
- [x] 공개 이용약관 `/terms`
- [x] 공개 개인정보 처리방침 `/privacy`
- [x] 공개 계정 삭제 `/account-deletion`
- [x] 처리 항목, 목적, 보관·삭제, 이용자 권리, 안전조치 명시
- [x] Render, Neon, Discord, Web Push의 외부·국외 처리 명시
- [x] 운영자와 개인정보 문의 이메일 `northstarlabshelp@gmail.com` 명시
- [x] 만 18세 이상 대상, 운동 정보의 비의료적 성격 명시
- [x] UGC 금지행위, 신고·차단, 이용 제한, 이의 제기 절차 명시
- [x] 게시글·댓글 작성 전 버전 기반 이용약관·커뮤니티 운영원칙 동의 적용
- [x] 한국어·영어·일본어·스페인어·중국어 간체·러시아어 법률 문구 교차 검수
- [x] 번역본과 한국어 원문의 관계 및 강행 현지법 우선 원칙 명시
- [x] 개인정보 판매, 맞춤형 광고 제공 및 광고 프로파일링을 하지 않음을 명시
- [x] 정지 계정의 신규 로그인과 기존 세션 접근을 모두 차단
- [!] 실제 배포 리전과 사업자 정보가 바뀌면 공개 처리방침의 국외 처리 항목을 배포 전에 갱신
- [!] 법률 자문을 받은 문서는 아니므로 사업자 등록 형태와 국내 적용 법령에 맞는 최종 검토 권장

## 3. 스토어 자료

- [x] 한국어 앱 이름, 간단한 설명, 자세한 설명 초안
- [x] 512x512 앱 아이콘
- [x] 1024x500 그래픽 이미지
- [x] 1080x1920 휴대전화 스크린샷 5장
- [x] 출시 노트
- [x] 데이터 보안 답변표
- [x] 건강 앱 선언 답변표
- [x] Play Console 제출 답변표
- [!] 현재 스크린샷은 2026-07-22 UI이므로 최신 배포 화면으로 다시 촬영 후 교체
- [ ] 스토어 등록정보의 지원 이메일 입력
- [ ] 개인정보 처리방침 URL 입력
- [ ] 계정 삭제 URL 입력

## 4. 배포 연결

- [!] 최종 HTTPS 서비스 주소 확정 및 Android `launch_url`, `asset_statements`, Manifest host 일치 확인
- [!] `/main`, `/privacy`, `/terms`, `/account-deletion` 공개 응답 확인
- [!] 운영 `SECRET_KEY`, `DATABASE_URL`, `SETCOUNTER_SESSION_COOKIE_SECURE=1`, `SETCOUNTER_TRUST_PROXY=1` 설정
- [!] 운영 `DISCORD_COMPLAINT_WEBHOOK_URL`, `PUBLIC_SUPPORT_EMAIL` 설정
- [!] Play App Signing SHA-256를 `ANDROID_SHA256_CERT_FINGERPRINT`에 설정
- [!] `/.well-known/assetlinks.json` 공개 응답과 Google Digital Asset Links 검증
- [!] 실제 기기에서 TWA가 주소 표시줄 없이 열리는지 확인
- [!] 운영 DB 마이그레이션, 사전 백업, 테이블·건수·소유권 검증
- [!] 공개 URL에서 개인정보 처리방침과 계정 삭제가 로그인 없이 동작하는지 확인

## 5. Play Console에서 직접 수행

- [ ] 개발자 신원·연락처·실기기 인증
- [ ] Play App Signing 등록
- [ ] 새로 생성한 최신 AAB 업로드
- [ ] 앱 액세스: 게스트로 핵심 기능 사용 가능하다고 안내
- [ ] 광고 포함 여부: 아니요
- [ ] 데이터 보안 설문 제출
- [ ] 건강 앱 선언: Activity and Fitness
- [ ] 콘텐츠 등급 설문과 만 18세 이상 타깃 설정
- [ ] UGC 신고·차단·운영 정책 경로 제출
- [ ] Data deletion 질문과 공개 삭제 URL 제출
- [ ] 무료 앱, 대한민국 배포 및 대상 국가 설정
- [!] 1차 출시는 대한민국만 선택하고, 다른 국가를 추가하기 전에 `localization-legal-review.md`의 국가별 출시 게이트를 완료
- [ ] 개인 개발자 계정이 2023-11-13 이후 생성됐다면 12명 이상이 14일 연속 참여하는 비공개 테스트 완료
- [ ] 사전 출시 보고서에서 충돌, ANR, 접근성, 보안 경고 확인
- [ ] 프로덕션 액세스 신청과 정책 상태 최종 확인

## 6. 비공개 산출물

- 업로드 키: `android/upload-key.jks` (Git 제외)
- 서명 설정: `android/keystore.properties` (Git 제외)
- AAB: `play-store/private/setcounter-1.0.0.aab` (Git 제외)
- AAB 크기: `1,233,338 bytes`
- AAB SHA-256: `A9771035FB179D600F390858868AC30B41D4FDB4D6A142A0A61390B234195E4F`
- 키 복구 정보는 D 드라이브의 별도 비공개 저장소와 추가 오프라인 위치에 백업

## 공식 기준

- 타깃 API: https://support.google.com/googleplay/android-developer/answer/11926878
- 데이터 보안: https://support.google.com/googleplay/android-developer/answer/10787469
- 계정 삭제: https://support.google.com/googleplay/android-developer/answer/13327111
- 건강 앱 선언: https://support.google.com/googleplay/android-developer/answer/14738291
- 건강 콘텐츠: https://support.google.com/googleplay/android-developer/answer/16679511
- UGC 정책: https://support.google.com/googleplay/android-developer/answer/12923286
- 신규 개인 계정 테스트: https://support.google.com/googleplay/android-developer/answer/14151465
- 신규 계정 실기기 인증: https://support.google.com/googleplay/android-developer/answer/14316361

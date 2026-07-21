# Set Counter Google Play 출시 체크리스트

## 완료된 준비

- [x] Android applicationId 확정: `com.setcounter.app`
- [x] versionCode 1, versionName 1.0.0
- [x] compileSdk/targetSdk 36, minSdk 23
- [x] Trusted Web Activity Android 프로젝트
- [x] 인터넷 및 알림 외 불필요 권한 미사용
- [x] cleartext HTTP 차단
- [x] 백업 비활성화
- [x] 업로드 키 로컬 생성 및 저장소 제외
- [x] 서명된 Android App Bundle 생성
- [x] 개인정보 처리방침 공개 경로
- [x] 이용약관 공개 경로
- [x] 앱 내 계정 삭제
- [x] 앱 밖 계정 삭제 경로
- [x] Digital Asset Links 서버 경로
- [x] 스토어 한국어 설명 초안
- [x] 데이터 보안 답변 초안
- [x] 제3자 운동 데이터 라이선스 문서

## Render 연결 후

- [ ] `https://setcounter.onrender.com/main` 정상 응답
- [ ] `/privacy`, `/terms`, `/account-deletion` 비로그인 접근 확인
- [ ] HTTPS에서 세션 쿠키 Secure 확인
- [ ] Render에 `DISCORD_COMPLAINT_WEBHOOK_URL` 설정
- [ ] Play App Signing 인증서 SHA-256을 `ANDROID_SHA256_CERT_FINGERPRINT`에 설정
- [ ] `/.well-known/assetlinks.json` 응답 및 Google DAL 검증
- [ ] TWA 주소 표시줄 없이 실행되는지 실제 Android 기기 확인
- [ ] 운동 저장, 로그인, 푸시, 계정 삭제 운영 통합 테스트

## Play Console에서 직접 해야 하는 항목

- [ ] 개발자 계정 및 신원/연락처 인증
- [ ] 공개 고객지원 이메일 확정 및 개인정보 처리방침에 반영
- [ ] 앱 생성 후 Play App Signing 등록
- [ ] `play-store/private/setcounter-1.0.0.aab` 업로드
- [ ] 앱 액세스: 회원가입 없이 익명으로 주요 기능 사용 가능하다고 설명
- [ ] 광고 포함 여부: 광고 SDK가 없다면 '아니요'
- [ ] 데이터 보안 설문 제출
- [ ] 콘텐츠 등급 설문 제출
- [ ] 타깃층 및 콘텐츠 설정
- [ ] 건강 앱 선언/관련 정책 질문 확인
- [ ] 국가/지역 및 무료 배포 설정
- [ ] 스토어 아이콘, 기능 그래픽, 휴대전화 스크린샷 등록
- [ ] 내부 테스트 트랙에서 설치 및 업데이트 검증
- [ ] 사전 출시 보고서의 충돌, 접근성, 보안 경고 확인
- [ ] 프로덕션 제출 전 정책 상태 재확인

## 비공개 파일

- AAB: `play-store/private/setcounter-1.0.0.aab`
- 업로드 키: `android/upload-key.jks`
- 서명 설정: `android/keystore.properties`
- 키 복구 정보: `D:\Tools\SetCounterAndroid\private\setcounter-upload-key-recovery.txt`

비공개 파일은 Git에 포함하지 않는다. 업로드 키와 복구 정보는 암호화된 별도 저장소에도 백업한다.

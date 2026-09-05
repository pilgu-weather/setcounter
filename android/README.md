# Set Counter Android

This module packages the Set Counter PWA as a Trusted Web Activity (TWA).

## Identity

- Application ID: `com.setcounter.app`
- Start URL: `https://setcounter.onrender.com/main`
- Minimum SDK: 23
- Target SDK: 36
- Version: `1.0.4` (`versionCode 5`)

The application ID cannot be changed after the first Play Store release.

## Build

Install JDK 17 and Android SDK Platform 36, then run:

```powershell
cd android
.\gradlew.bat bundleRelease
```

Release signing reads ignored values from `android/keystore.properties`:

```properties
storeFile=upload-key.jks
storePassword=replace-me
keyAlias=setcounter-upload
keyPassword=replace-me
```

Never commit the keystore or its passwords. Enroll the first release in Play App Signing and keep the upload key backed up outside this repository.

## Digital Asset Links

After Play App Signing is enabled, copy the Play app-signing SHA-256 certificate fingerprint into the server environment variable `ANDROID_SHA256_CERT_FINGERPRINT`. The server publishes it at:

`https://setcounter.onrender.com/.well-known/assetlinks.json`

Until this fingerprint is deployed and the HTTPS endpoint is reachable, Android will open the app as a Custom Tab instead of a verified full-screen TWA.

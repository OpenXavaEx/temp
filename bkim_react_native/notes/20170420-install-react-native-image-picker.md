Source
====
https://github.com/react-community/react-native-image-picker

Install
====
npm install react-native-image-picker@0.24 --save
```
bkim_react_native@0.0.1 /workspace/bkim_react_native
└── react-native-image-picker@0.24.1
```

react-native link react-native-image-picker
```
rnpm-install info Linking react-native-image-picker android dependency
rnpm-install info Android module react-native-image-picker has been successfully linked
rnpm-install info Linking react-native-image-picker ios dependency
rnpm-install info iOS module react-native-image-picker has been successfully linked
```

***

Post install - Android
====
Update the android build tools version to 2.2.+ in android/build.gradle:
```
buildscript {
    ...
    dependencies {
        classpath 'com.android.tools.build:gradle:2.2.+' // <- USE 2.2.+ version
    }
    ...
}
...
```

Update the gradle version to 2.14.1 in android/gradle/wrapper/gradle-wrapper.properties:
```
...
distributionUrl=https\://services.gradle.org/distributions/gradle-2.14.1-all.zip
```



Add the required permissions in AndroidManifest.xml:
```
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

Post install - iOS
====
```
For iOS 10+, Add the NSPhotoLibraryUsageDescription, NSCameraUsageDescription, and NSMicrophoneUsageDescription (if allowing video) keys to your Info.plist with strings describing why your app needs these permissions.
```

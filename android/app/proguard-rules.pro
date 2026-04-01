# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep @ReactMethod annotations
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep components and modules from JS bundle
-keep class com.lingshu.paipan.** { *; }
-keep class com.divination.** { *; }

# Keep data classes used by Jackson/Gson (if any)
-keep class com.lingshu.paipan.models.** { *; }
-keep class com.lingshu.paipan.data.** { *; }

# Keep enum values (important for JS bridge)
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Don't obfuscate JS interface classes
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

# Keep custom view managers and animations
-keep public class * extends com.facebook.react.uimanager.ViewManager {
    public <init>(com.facebook.react.bridge.ReactApplicationContext);
}
-keep class com.facebook.react.animation.** { *; }

# Keep all classes in the main package (safe for now)
-keep class com.lingshu.paipan.** { *; }

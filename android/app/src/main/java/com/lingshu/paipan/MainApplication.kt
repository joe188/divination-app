package com.lingshu.paipan

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.swmansion.rnscreens.ScreensPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override fun getReactNativeHost(): ReactNativeHost =
      object : ReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            listOf<ReactPackage>(
                MainReactPackage(),
                ScreensPackage(),
                SafeAreaContextPackage()
            )

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
      }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}
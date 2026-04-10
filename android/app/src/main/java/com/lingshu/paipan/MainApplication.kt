package com.lingshu.paipan

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : ReactNativeHost(this) {
        override fun getJSMainModuleName(): String = "index"
        override fun getUseDeveloperSupport(): Boolean = false
        override fun getPackages(): List<ReactPackage> = emptyList()
      }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}

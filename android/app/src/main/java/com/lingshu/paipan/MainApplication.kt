package com.lingshu.paipan

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override fun getReactNativeHost(): ReactNativeHost =
      object : ReactNativeHost(this) {
        override fun getPackages(): List<com.facebook.react.ReactPackage> =
            listOf<com.facebook.react.ReactPackage>(MainReactPackage())

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = false
      }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}
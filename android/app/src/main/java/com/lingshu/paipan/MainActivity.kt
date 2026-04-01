package com.lingshu.paipan

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "DivinationApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegate(this, mainComponentName)
}

import java.util.Properties

plugins {
  id("com.android.application")
  id("app.cash.licensee")
}

dependencies {
  implementation(project(":shared"))
}

android {
  compileSdk = libs.versions.compileSdk.get().toInt()
  namespace = "graphqlconf.app"

  defaultConfig {
    minSdk = libs.versions.minSdk.get().toInt()
    targetSdk = libs.versions.targetSdk.get().toInt()

    versionCode = 10
    versionName = "10"
  }

  signingConfigs {
    create("release") {
      if (file("release.jks").exists()) {
        storeFile = file("release.jks")
      }
      if (file("keystore.properties").exists()) {
        val props = file("keystore.properties").inputStream().use {
          Properties().apply {
            load(it)
          }
        }

        storePassword = props.get("STORE_PASSWORD").toString()
        keyAlias = props.get("KEY_ALIAS").toString()
        keyPassword = props.get("KEY_PASSWORD").toString()
      }
    }
  }
  buildTypes {
    release {
      signingConfig = signingConfigs.getByName("release")
      isDebuggable = false
      isMinifyEnabled = false
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
      )
    }
  }
}

licensee {
  allow("Apache-2.0")
  allow("MIT")
  allowUrl("https://opensource.org/license/mit")
}

tasks.register("updateResources", Copy::class.java) {
  from(file("build/reports/licensee/androidRelease/artifacts.json"))
  into(file("src/commonMain/composeResources/files"))
  dependsOn("licenseeAndroidRelease")
}

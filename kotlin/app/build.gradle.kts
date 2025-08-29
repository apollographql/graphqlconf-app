import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.compose.compiler.gradle.ComposeFeatureFlag
import java.util.Properties

plugins {
  id("com.apollographql.apollo")
  id("org.jetbrains.kotlin.multiplatform")
  id("org.jetbrains.kotlin.plugin.compose")
  id("org.jetbrains.kotlin.plugin.serialization")
  id("org.jetbrains.compose")
  id("org.jetbrains.compose.hot-reload")
  id("com.gradleup.compat.patrouille")
  id("com.android.application")
  id("app.cash.licensee")
}

compatPatrouille {
  java(17)
}

kotlin {
  jvm()
  androidTarget()

  compilerOptions {
    optIn.add("com.russhwolf.settings.ExperimentalSettingsApi")
    optIn.add("kotlin.time.ExperimentalTime")
  }

  sourceSets {
    getByName("commonMain").dependencies {
      implementation(apollo.deps.runtime)
      implementation(apollo.deps.normalizedCache)
      implementation(apollo.deps.normalizedCacheSqlite)

      implementation(compose.runtime)
      implementation(compose.foundation)
      implementation(compose.material3)
      implementation(compose.components.resources)

      implementation(libs.kotlinx.datetime)
      implementation(libs.kotlinx.serialization.json)
      implementation(libs.kotlinx.coroutines.core)
      implementation(libs.androidx.lifecycle.runtime.compose)
      implementation(libs.androidx.navigation.compose)
      implementation(libs.coil.compose)
      implementation(libs.coil.network.ktor3)

      // Multiplatform Settings
      implementation(libs.settings)
      implementation(libs.settings.serialization)
      implementation(libs.settings.observable)
      implementation(libs.settings.coroutines)

      implementation(libs.components.ui.tooling.preview)
    }

    getByName("androidMain").dependencies {
      implementation(libs.androidx.core.splashscreen)
      implementation(libs.androidx.activity.compose)
      implementation(libs.ktor.client.okhttp)
      implementation(libs.androidx.preference)
      implementation(libs.androidx.core)
    }

    getByName("commonTest").dependencies {
      implementation(kotlin("test"))
    }

    getByName("jvmMain").dependencies {
      implementation(compose.desktop.currentOs)
      implementation(compose.desktop.common)
      implementation(libs.ktor.client.okhttp)
      implementation(libs.coil.network.okhttp)

      implementation(libs.kotlinx.coroutines.swing)
    }

    getByName("jvmTest").dependencies {
      implementation(compose.desktop.currentOs)
      implementation(compose.desktop.uiTestJUnit4)
    }
  }
}

apollo {
  service("service") {
    packageName.set("graphqlconf.api")
    schemaFiles.from("../backend/graphql/schema.graphqls")
    mapScalar("LocalDateTime", "kotlinx.datetime.LocalDateTime", "graphqlconf.app.LocalDateTimeAdapter")

    introspection {
      endpointUrl.set("https://graphqlconf.app/graphql")
      schemaFile.set(file("../backend/graphql/schema.graphqls"))
    }
  }
}

compose.desktop {
  application {
    mainClass = "MainKt"

    nativeDistributions {
      targetFormats(TargetFormat.Dmg, TargetFormat.Deb)
      packageName = "GraphQLConf"
      packageVersion = "1.0.0"

      val iconsRoot = project.file("desktop-icons")
      macOS {
        iconFile.set(iconsRoot.resolve("icon-mac.icns"))
      }
      linux {
        iconFile.set(iconsRoot.resolve("icon-linux.png"))
      }
    }

    buildTypes.release.proguard {
      configurationFiles.from(project.file("rules.pro"))
    }
  }
}

composeCompiler {
  featureFlags.add(ComposeFeatureFlag.OptimizeNonSkippingGroups)
}

compose.resources {
  publicResClass = true
  nameOfResClass = "Res"
}

android {
  compileSdk = libs.versions.compileSdk.get().toInt()
  namespace = "graphqlconf.app"

  defaultConfig {
    minSdk = libs.versions.minSdk.get().toInt()
    targetSdk = libs.versions.targetSdk.get().toInt()

    versionCode = 2
    versionName = "2"
  }

  signingConfigs {
    create("release") {
      storeFile = file("release.jks")
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

tasks.register("allJar", Jar::class.java) {
  from(tasks.named("jvmJar").map { zipTree((it as Jar).archiveFile) })
  from(configurations.getByName("jvmRuntimeClasspath").map { if (it.isDirectory) it else zipTree(it) })
  duplicatesStrategy = DuplicatesStrategy.EXCLUDE

  this.archiveFileName.set("all.jar")
  manifest {
    attributes(
      "Main-Class" to "MainKt"
    )
  }
}

licensee {
  allow("Apache-2.0")
  allow("MIT")
  allowUrl("https://opensource.org/license/mit")
}

afterEvaluate {
  afterEvaluate {
    tasks.named("licenseeAndroidRelease") {
      outputs.files.forEach {
        println(it)
      }
    }
  }
}

tasks.register("updateResources", Copy::class.java) {
  from(file("build/reports/licensee/androidRelease/artifacts.json"))
  into(file("src/commonMain/composeResources/files"))
  dependsOn("licenseeAndroidRelease")
}

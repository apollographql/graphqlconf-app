import gratatouille.gradle.GratatouilleExtension

plugins {
  alias(libs.plugins.kgp.jvm)
  alias(libs.plugins.ksp)
  alias(libs.plugins.gratatouille)
  alias(libs.plugins.compat.patrouille)
}

buildscript {
  dependencies {
    classpath(libs.gratatouille)
    classpath(libs.ksp)
    classpath(libs.compat.patrouille)
  }
}
group = "graphqlconf.app"

dependencies {
  implementation(libs.kgp)
  implementation(libs.kotlinx.serialization)
  implementation(libs.ksp)
  implementation(libs.apollo.kotlin.execution.gradle.plugin)
  implementation(libs.okhttp)
  implementation(platform(libs.google.cloud.bom))
  implementation(libs.google.cloud.storage)
  implementation(libs.jib.core)
  implementation(libs.google.cloud.storage)
  implementation(libs.google.cloud.run)
  implementation(libs.compat.patrouille)
  implementation(libs.gradle.api)
  implementation(libs.apollo.gradle.plugin)
  implementation(libs.agp)
  implementation(libs.compose.gradle.plugin)
  implementation(libs.compose.compiler.gradle.plugin)
  implementation(libs.hot.reload)
  implementation(libs.compat.patrouille)
  implementation(libs.licensee)
  implementation(libs.apollo.kotlin.compiler.plugin.gradle.plugin)
}

extensions.getByType(GratatouilleExtension::class.java).apply {
  codeGeneration()
}

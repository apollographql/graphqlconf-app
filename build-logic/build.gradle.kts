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
  add("implementation", libs.kgp)
  add("implementation", libs.kotlinx.serialization)
  add("implementation", libs.ksp)
  add("implementation", libs.apollo.kotlin.execution.gradle.plugin)
  add("implementation", libs.okhttp)
  add("implementation", platform(libs.google.cloud.bom))
  add("implementation", libs.google.cloud.storage)
  add("implementation", libs.jib.core)
  add("implementation", libs.google.cloud.storage)
  add("implementation", libs.google.cloud.run)
  add("implementation", libs.compat.patrouille)
  add("implementation", libs.gradle.api)
  add("implementation", libs.apollo.gradle.plugin)
  add("implementation", libs.agp)
  add("implementation", libs.compose.gradle.plugin)
  add("implementation", libs.compose.compiler.gradle.plugin)
  add("implementation", libs.hot.reload)
  add("implementation", libs.compat.patrouille)
}

extensions.getByType(GratatouilleExtension::class.java).apply {
  codeGeneration()
}

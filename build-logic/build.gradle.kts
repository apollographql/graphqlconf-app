import gratatouille.gradle.GratatouilleExtension

plugins {
  id("base")
  id("java-gradle-plugin")
}

buildscript {
  dependencies {
    classpath(libs.kgp)
    classpath(libs.gratatouille)
    classpath(libs.ksp)
    classpath(libs.compat.patrouille)
  }
}
group = "build-logic"

apply(plugin = "org.jetbrains.kotlin.jvm")
apply(plugin = "com.gradleup.gratatouille")
apply(plugin = "com.google.devtools.ksp")


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
}

extensions.getByType(GratatouilleExtension::class.java).apply {
  codeGeneration()
}

gradlePlugin {
  plugins {
    // Make it possible to use this project if it is an included build
    create("build-logic") {
      id = "build-logic"
      implementationClass = "Unused"
    }
  }
}

fun removeGradleApiFromApi() {
  val apiDependencies = project.configurations.getByName("api").dependencies
  apiDependencies.firstOrNull {
    it is FileCollectionDependency
  }.let {
    apiDependencies.remove(it)
  }
}
removeGradleApiFromApi()
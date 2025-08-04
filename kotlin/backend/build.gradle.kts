import org.jetbrains.kotlin.gradle.plugin.getKotlinPluginVersion

plugins {
  id("org.jetbrains.kotlin.jvm")
  id("com.google.devtools.ksp")
  id("com.apollographql.execution")
  id("org.jetbrains.kotlin.plugin.serialization")
  id("com.gradleup.loud")
  id("com.gradleup.compat.patrouille")
}

compatPatrouille {
  java(17)
  kotlin(getKotlinPluginVersion())
}
dependencies {
  implementation(libs.kotlinx.serialization.json)
  implementation(libs.apollo.kotlin.execution.runtime)
  implementation(libs.apollo.kotlin.execution.ktor)
  implementation(libs.ktor.server.netty)
  implementation(libs.ktor.forwarded.header)
  implementation(libs.kotlin.test)
  implementation(libs.kotlinx.datetime)
  implementation(libs.slf4j.simple)
}

// Configure codegen
apolloExecution {
  service("service") {
    packageName = "graphqlconf"
  }
}

loud {
  region.set("europe-west4")
  project.set("graphqlconf-mobile")
  serviceAccount.set(System.getenv("GOOGLE_SERVICES_JSON"))

  artifactRegistry {
    repository.set("main")
    imageName.set("main")
  }
  jib {
    baseImageReference.set("openjdk:17-alpine")
    mainClass.set("MainKt")
  }
  cloudRun {
    service.set("main")
  }
}
registerDownloadResourcesTask()

tasks.register("run", JavaExec::class.java) {
  classpath(java.sourceSets.main.get().output)
  classpath(configurations.getByName("runtimeClasspath"))
  mainClass.set("MainKt")
}
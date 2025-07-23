plugins {
  id("org.jetbrains.kotlin.jvm")
  id("com.google.devtools.ksp")
  id("com.apollographql.execution")
  id("org.jetbrains.kotlin.plugin.serialization")
}

dependencies {
  implementation(libs.kotlinx.serialization.json)
  implementation(libs.apollo.kotlin.execution.runtime)
  implementation(libs.apollo.kotlin.execution.ktor)
  implementation(libs.ktor.server.netty)
  implementation(libs.kotlin.test)
  implementation(libs.kotlinx.datetime)

}

// Configure codegen
apolloExecution {
  service("service") {
    packageName = "graphqlconf"
  }
}

registerDownloadResourcesTask()
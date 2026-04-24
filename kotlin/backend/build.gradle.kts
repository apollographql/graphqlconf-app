import org.jetbrains.kotlin.gradle.plugin.getKotlinPluginVersion

plugins {
  id("org.jetbrains.kotlin.jvm")
  id("com.google.devtools.ksp")
  id("com.apollographql.execution")
  id("org.jetbrains.kotlin.plugin.serialization")
  id("com.gradleup.loud")
  id("com.gradleup.tapmoc")
  id("com.apollographql.apollo")
}

tapmoc {
  java(17)
  kotlin(getKotlinPluginVersion())
}

kotlin {
  compilerOptions {
    optIn.add("kotlinx.serialization.ExperimentalSerializationApi")
    optIn.add("kotlinx.coroutines.DelicateCoroutinesApi")
  }
}
dependencies {
  implementation(libs.kotlinx.serialization.json)
  implementation(libs.apollo.kotlin.execution.runtime)
  implementation(libs.apollo.kotlin.execution.ktor)
  implementation(libs.ktor.server.netty)
  implementation(libs.ktor.client.okhttp)
  implementation(libs.ktor.forwarded.header)
  implementation(libs.kotlin.test)
  implementation(libs.kotlinx.datetime)
  implementation(libs.slf4j.simple)
  implementation(libs.okhttp)
  implementation(apollo.deps.runtime)
}

// Configure codegen
apolloExecution {
  service("service") {
    packageName = "graphqlconf"
  }
}

loud {
  region.set("us-west1")
  project.set("graphqlconf-mobile")
  serviceAccount.set(System.getenv("GOOGLE_SERVICES_JSON"))

  artifactRegistry {
    repository.set("us")
    imageName.set("main")
  }
  jib {
    baseImageReference.set("azul/zulu-openjdk:25")
    mainClass.set("MainKt")
  }
  cloudRun {
    service.set("us")
  }
}
registerDownloadResourcesTask()

tasks.register("run", JavaExec::class.java) {
  classpath(java.sourceSets.main.get().output)
  classpath(configurations.getByName("runtimeClasspath"))
  mainClass.set("MainKt")
}

apollo {
  service("supabase") {
    packageName.set("app.graphqlconf.supabase")
    introspection {
      schemaFile.set(file("src/main/graphql/schema.graphqls"))
      endpointUrl.set("https://ejuwwdxlemkjxfjrrseb.supabase.co/graphql/v1")
      headers.put("apiKey", "sb_publishable_5E7EbV547Wu9kX9GRYiV_Q_q7oHk0CD")
    }
  }
}
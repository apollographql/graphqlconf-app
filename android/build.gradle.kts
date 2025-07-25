plugins {
    id("org.jetbrains.kotlin.jvm")
    id("com.apollographql.apollo")
}

dependencies {
  implementation("com.apollographql.apollo:apollo-compiler")
  implementation("com.apollographql.apollo:apollo-runtime")
  testImplementation(kotlin("test"))
}

apollo {
  service("service") {
    packageName.set("graphqlconf.api")
    schemaFiles.from("../backend/graphql/schema.graphqls")
  }
}
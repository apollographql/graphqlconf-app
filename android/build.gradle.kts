plugins {
  id("com.apollographql.apollo")
  id("org.jetbrains.kotlin.multiplatform")
}

kotlin {
  jvm()
  sourceSets {
    getByName("commonMain") {
      dependencies {
        implementation("com.apollographql.apollo:apollo-runtime")
      }
    }

    getByName("commonTest") {
      dependencies {
        implementation(kotlin("test"))
      }
    }
  }
}

apollo {
  service("service") {
    packageName.set("graphqlconf.api")
    schemaFiles.from("../backend/graphql/schema.graphqls")
  }
}
plugins {
  alias(libs.plugins.kgp.jvm)
}

group = "apollo.compose"

dependencies {
  implementation(libs.kgp)
  implementation(libs.ksp)
  implementation(libs.librarian)
  implementation(libs.compat.patrouille)
  implementation(libs.gratatouille)
  implementation(libs.compose.compiler.gradle.plugin)
}
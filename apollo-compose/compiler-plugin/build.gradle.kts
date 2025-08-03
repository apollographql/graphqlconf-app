import com.gradleup.librarian.gradle.Librarian

plugins {
  id("org.jetbrains.kotlin.jvm")
}

Librarian.module(project)

dependencies {
  compileOnly(libs.kotlin.compilerEmbeddable)
  compileOnly("org.jetbrains.kotlin:kotlin-stdlib")
}

kotlin {
  compilerOptions {
    optIn.addAll(
      "org.jetbrains.kotlin.compiler.plugin.ExperimentalCompilerApi",
      "org.jetbrains.kotlin.ir.symbols.UnsafeDuringIrConstructionAPI",
      "org.jetbrains.kotlin.backend.common.extensions.ExperimentalAPIForScriptingPlugin",
    )
  }
}
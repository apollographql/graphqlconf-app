package apollo.compose.compiler

import apollo.compose.compiler.fir.ApolloFirExtensionRegistrar
import org.jetbrains.kotlin.backend.common.extensions.IrGenerationExtension
import org.jetbrains.kotlin.compiler.plugin.CompilerPluginRegistrar
import org.jetbrains.kotlin.compiler.plugin.template.ir.SimpleIrGenerationExtension
import org.jetbrains.kotlin.config.CompilerConfiguration
import org.jetbrains.kotlin.fir.extensions.FirExtensionRegistrarAdapter

class ApolloCompilerPluginRegistrar : CompilerPluginRegistrar() {
  override val supportsK2: Boolean
    get() = true

  override fun ExtensionStorage.registerExtensions(
    configuration: CompilerConfiguration
  ) {
    FirExtensionRegistrarAdapter.registerExtension(ApolloFirExtensionRegistrar())
    IrGenerationExtension.registerExtension(SimpleIrGenerationExtension())
  }
}

/**
 * Make sure the string is correctly parsed by the Kotlin parser. Especially, ',' is used to separate plugin arguments:
 * https://github.com/Jetbrains/kotlin/blob/2022ff715bb3daa0c080f6298beae56d1f7276a5/compiler/cli/cli-common/src/org/jetbrains/kotlin/cli/common/arguments/parseCommandLineArguments.kt#L295
 */
private fun String.unescape(): String {
  val length = length
  return buildString {
    var i = 0
    while (i < length) {
      when (val c = this@unescape.get(i)) {
        '\\' -> {
          check(i + 5 < length) {
            "Unterminated escape sequence"
          }
          check(this@unescape.get(i + 1) == 'u') {
            "Invalid escape sequence"
          }
          val code = this@unescape.substring(i + 2, i + 6).toIntOrNull()
          check(code != null) {
            "Invalid escape sequence"
          }
          appendCodePoint(code)
          i += 6
        }

        else -> {
          append(c)
          i++
        }
      }
    }
  }
}
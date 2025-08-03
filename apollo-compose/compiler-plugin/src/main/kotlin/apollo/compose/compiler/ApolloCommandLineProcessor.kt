package apollo.compose.compiler

import org.jetbrains.kotlin.compiler.plugin.AbstractCliOption
import org.jetbrains.kotlin.compiler.plugin.CliOption
import org.jetbrains.kotlin.compiler.plugin.CliOptionProcessingException
import org.jetbrains.kotlin.compiler.plugin.CommandLineProcessor
import org.jetbrains.kotlin.config.CompilerConfiguration
import org.jetbrains.kotlin.config.CompilerConfigurationKey

class ApolloCommandLineProcessor: CommandLineProcessor {
  override val pluginId: String
    get() = "apollo.compose"
  override val pluginOptions: Collection<AbstractCliOption>
    get() {
      return ApolloOption.entries.map { it.raw.cli }
    }

  override fun processOption(option: AbstractCliOption, value: String, configuration: CompilerConfiguration) {
    super.processOption(option, value, configuration)
    when (val apolloOption = optionsByName.get(option.optionName)) {
      null -> throw CliOptionProcessingException("Unknown plugin option: ${option.optionName}")
      else -> configuration.put(apolloOption.raw.key, value)
    }
  }
}

internal enum class ApolloOption(
  val raw: RawApolloOption<*>
)  {
  SCHEMA(
    RawApolloOption<String>(
      optionName = "schema",
      valueDescription = "The schema to use",
      description = "The schema to use",
      required = true,
      allowMultipleOccurrences = false
    )
  )
}

internal class RawApolloOption<T>(
  optionName: String,
  valueDescription: String,
  description: String,
  required: Boolean,
  allowMultipleOccurrences: Boolean
) {
  val cli = CliOption(
    optionName = optionName,
    valueDescription = valueDescription,
    description = description,
    required = required,
    allowMultipleOccurrences = allowMultipleOccurrences
  )
  val key: CompilerConfigurationKey<String> = CompilerConfigurationKey(optionName)
}

internal val optionsByName = ApolloOption.entries.associateBy { it.raw.cli.optionName}

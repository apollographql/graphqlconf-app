package apollo.compose.compiler.fir

import org.jetbrains.kotlin.fir.extensions.FirExtensionRegistrar

class ApolloFirExtensionRegistrar : FirExtensionRegistrar() {
  override fun ExtensionRegistrarContext.configurePlugin() {
    +::ApolloFirDeclarationGenerationExtension
  }
}

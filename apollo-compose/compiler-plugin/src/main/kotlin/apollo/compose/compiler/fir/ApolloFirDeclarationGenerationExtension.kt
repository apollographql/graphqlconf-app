package apollo.compose.compiler.fir

import org.jetbrains.kotlin.fir.FirSession
import org.jetbrains.kotlin.fir.extensions.FirDeclarationGenerationExtension

class ApolloFirDeclarationGenerationExtension(
  session: FirSession,
) : FirDeclarationGenerationExtension(session) {

}

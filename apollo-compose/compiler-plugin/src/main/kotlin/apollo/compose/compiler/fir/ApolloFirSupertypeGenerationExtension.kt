package apollo.compose.compiler.fir

import org.jetbrains.kotlin.descriptors.ClassKind
import org.jetbrains.kotlin.fir.FirSession
import org.jetbrains.kotlin.fir.declarations.FirClassLikeDeclaration
import org.jetbrains.kotlin.fir.declarations.FirRegularClass
import org.jetbrains.kotlin.fir.extensions.AnnotationFqn
import org.jetbrains.kotlin.fir.extensions.FirDeclarationPredicateRegistrar
import org.jetbrains.kotlin.fir.extensions.FirSupertypeGenerationExtension
import org.jetbrains.kotlin.fir.extensions.predicate.LookupPredicate
import org.jetbrains.kotlin.fir.extensions.predicateBasedProvider
import org.jetbrains.kotlin.fir.plugin.createConeType
import org.jetbrains.kotlin.fir.resolve.defaultType
import org.jetbrains.kotlin.fir.types.ConeKotlinType
import org.jetbrains.kotlin.fir.types.FirResolvedTypeRef
import org.jetbrains.kotlin.name.ClassId
import org.jetbrains.kotlin.name.FqName
import org.jetbrains.kotlin.name.Name

class ApolloFirSupertypeGenerationExtension(session: FirSession) : FirSupertypeGenerationExtension(session) {
  companion object {
    private val PREDICATE = LookupPredicate.create {
      annotated(AnnotationFqn("apollo.compose.GraphQL"))
    }
  }

  override fun FirDeclarationPredicateRegistrar.registerPredicates() {
    register(PREDICATE)
  }

  override fun needTransformSupertypes(declaration: FirClassLikeDeclaration): Boolean {
    return declaration is FirRegularClass && declaration.classKind == ClassKind.CLASS && session.predicateBasedProvider.matches(PREDICATE, declaration)
  }

  override fun computeAdditionalSupertypes(
    classLikeDeclaration: FirClassLikeDeclaration,
    resolvedSupertypes: List<FirResolvedTypeRef>,
    typeResolver: TypeResolveService
  ): List<ConeKotlinType> {
    return listOf(
      ClassId(FqName("apollo.compose"), Name.identifier("Operation"))
        .createConeType(session, arrayOf(
          ClassId(FqName("apollo.compose"), Name.identifier("Operation")).createNestedClassId(Name.identifier("Data")).createConeType(session)
        ))
    )
  }
}
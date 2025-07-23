import com.apollographql.execution.ktor.apolloModule
import com.apollographql.execution.ktor.apolloSandboxModule
import com.apollographql.execution.ktor.apolloSubscriptionModule
import graphqlconf.ServiceExecutableSchemaBuilder
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
  embeddedServer(Netty, port = 8080) {
    val executableSchema = ServiceExecutableSchemaBuilder().build()
    // /graphql route
    apolloModule(executableSchema)
    // /subscription route
    apolloSubscriptionModule(executableSchema)
    // /sandbox/index.html route
    apolloSandboxModule()
  }.start(wait = true)
}
import com.apollographql.execution.ktor.apolloModule
import com.apollographql.execution.ktor.apolloSandboxModule
import com.apollographql.execution.ktor.apolloSubscriptionModule
import graphqlconf.ServiceExecutableSchemaBuilder
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.forwardedheaders.*
import io.ktor.server.util.*

fun main(args: Array<String>) {
  embeddedServer(Netty, port = 8080) {
    // XForwardedHeaders allow us to get the origin url for the sandbox url
    install(XForwardedHeaders)

    val executableSchema = ServiceExecutableSchemaBuilder().build()
    // /graphql route
    apolloModule(executableSchema)
    // /subscription route
    apolloSubscriptionModule(executableSchema)
    // /sandbox/index.html route
    apolloSandboxModule(title = "GraphQLConf mobile API", sandboxPath = "/") { call ->
      call.url {
        path("/graphql")
      }
    }
  }.start(wait = true)
}
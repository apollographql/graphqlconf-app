import com.apollographql.execution.ktor.apolloModule
import com.apollographql.execution.ktor.apolloSandboxModule
import com.apollographql.execution.ktor.apolloSubscriptionModule
import graphqlconf.ServiceExecutableSchemaBuilder
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.forwardedheaders.*
import io.ktor.server.request.*
import io.ktor.server.util.*
import io.ktor.util.*

fun main(args: Array<String>) {
  embeddedServer(Netty, port = 8080) {
    install(XForwardedHeaders)

    val executableSchema = ServiceExecutableSchemaBuilder().build()
    // /graphql route
    apolloModule(executableSchema)
    // /subscription route
    apolloSubscriptionModule(executableSchema)
    // /sandbox/index.html route
    apolloSandboxModule(title = "GraphQLConf mobile API", sandboxPath = "/") { call ->

      println("HEADERS: ${call.request.headers.toMap().map { "${it.key}=${it.value}" }.joinToString(",")}")
      println("origin: ${call.request.origin.remoteHost}")
      call.url {
        path("/graphql")
      }
    }
  }.start(wait = true)
}
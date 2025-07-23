import com.apollographql.execution.ktor.apolloModule
import com.apollographql.execution.ktor.apolloSandboxModule
import com.apollographql.execution.ktor.apolloSubscriptionModule
import graphqlconf.ServiceExecutableSchemaBuilder
import io.ktor.http.URLProtocol
import io.ktor.http.path
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.request.header
import io.ktor.server.request.port
import io.ktor.server.util.url

fun main(args: Array<String>) {
  embeddedServer(Netty, port = 8080) {
    val executableSchema = ServiceExecutableSchemaBuilder().build()
    // /graphql route
    apolloModule(executableSchema)
    // /subscription route
    apolloSubscriptionModule(executableSchema)
    // /sandbox/index.html route
    apolloSandboxModule(title = "GraphQLConf mobile API", sandboxPath = "/") { call ->
      call.url {
        /**
         * Trying to guess if the client connected through HTTPS
         */
        val proto = call.request.header("x-forwarded-proto")
        when (proto) {
          "http" -> protocol = URLProtocol.HTTP
          "https" -> protocol = URLProtocol.HTTPS
        }

        if (port != 8080) {
          /**
           * We are not running locally
           */
          when(protocol) {
            URLProtocol.HTTP -> port = 80
            URLProtocol.HTTPS -> port = 443
          }
        }
        path("/graphql")
      }
    }
  }.start(wait = true)
}
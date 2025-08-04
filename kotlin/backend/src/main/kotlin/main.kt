import com.apollographql.execution.ktor.apolloModule
import com.apollographql.execution.ktor.apolloSandboxModule
import com.apollographql.execution.ktor.apolloSubscriptionModule
import graphqlconf.ServiceExecutableSchemaBuilder
import io.ktor.http.*
import io.ktor.server.application.install
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.forwardedheaders.ForwardedHeaders
import io.ktor.server.request.*
import io.ktor.server.util.*
import io.ktor.util.toMap

fun main(args: Array<String>) {
  embeddedServer(Netty, port = 8080) {
    install(ForwardedHeaders)

    val executableSchema = ServiceExecutableSchemaBuilder().build()
    // /graphql route
    apolloModule(executableSchema)
    // /subscription route
    apolloSubscriptionModule(executableSchema)
    // /sandbox/index.html route
    apolloSandboxModule(title = "GraphQLConf mobile API", sandboxPath = "/") { call ->

      println("HEADERS: ${call.request.headers.toMap().map { "${it.key}=${it.value}" }.joinToString(",")}")
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
          when (protocol) {
            URLProtocol.HTTP -> port = 80
            URLProtocol.HTTPS -> port = 443
          }
        }

        path("/graphql")
      }
    }
  }.start(wait = true)
}
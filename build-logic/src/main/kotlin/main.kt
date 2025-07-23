import gratatouille.tasks.GManuallyWired
import gratatouille.tasks.GOutputDirectory
import gratatouille.tasks.GTask
import okhttp3.OkHttpClient
import okhttp3.Request
import okio.buffer
import okio.sink
import org.gradle.api.Project
import org.gradle.api.Task
import org.gradle.api.tasks.TaskProvider
import java.io.File

private val client = OkHttpClient()

@GTask(pure = false)
@Suppress("Unused")
fun downloadResourcesInternal(
  @GManuallyWired
  outputDirectory: GOutputDirectory
) {
  download(
    "https://raw.githubusercontent.com/graphql/graphql.github.io/b1d26dbe70a193b999efb661b9eabcce0c44a17a/scripts/sync-sched/schedule-2025.json",
    outputDirectory.resolve("schedule-2025.json")
  )
  download(
    "https://raw.githubusercontent.com/graphql/graphql.github.io/b1d26dbe70a193b999efb661b9eabcce0c44a17a/scripts/sync-sched/speakers.json",
    outputDirectory.resolve("speakers.json")
  )
}

private fun download(url: String, outputFile: File) {
  Request.Builder()
    .url(url)
    .get()
    .build()
    .let {
      client.newCall(it).execute()
    }.use {
      check(it.isSuccessful) {
        "Cannot download '$url': ${it.body.string()}"
      }

      outputFile.sink().buffer().use { sink ->
        sink.writeAll(it.body.source())
      }
    }
}

fun Project.registerDownloadResourcesTask(): TaskProvider<out Task> = registerDownloadResourcesInternalTask(
  "updateResources",
  outputDirectory = project.provider { layout.projectDirectory.dir("src/main/resources") }
)
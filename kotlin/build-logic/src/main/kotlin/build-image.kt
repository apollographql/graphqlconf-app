import com.google.cloud.tools.jib.api.Containerizer
import com.google.cloud.tools.jib.api.Jib
import com.google.cloud.tools.jib.api.RegistryImage
import com.google.cloud.tools.jib.api.buildplan.AbsoluteUnixPath
import gratatouille.tasks.GClasspath
import gratatouille.tasks.GLogger
import gratatouille.tasks.GTask

@GTask
fun buildImage(
  logger: GLogger,
  gcpRegion: String,
  gcpProject: String,
  gcpServiceAccount: String,
  repository: String,
  imageName: String,
  baseImageReference: String,
  classPath: GClasspath,
  mainClass: String,
) {
  val imageRef = "$gcpRegion-docker.pkg.dev/$gcpProject/$repository/${imageName}"
  val containerizer = Containerizer.to(
    RegistryImage.named(imageRef)
      .addCredential("_json_key", gcpServiceAccount)
  )

  Jib.from(baseImageReference)
    .addLayer(classPath.map { it.file.toPath() }, AbsoluteUnixPath.get("/"))
    .setEntrypoint(
      "java",
      "-cp",
      (classPath.map { "/${it.file.name}" }).joinToString(":"),
      mainClass
    )
    .containerize(containerizer)

  logger.lifecycle("Image deployed to '$imageRef'")
}
import gratatouille.wiring.GPlugin
import org.gradle.api.Action
import org.gradle.api.Project
import org.gradle.api.provider.Property

@GPlugin(id = "com.gradleup.loud")
internal fun loud(project: Project) {
  val extension = project.extensions.create("loud", LoudExtension::class.java, project)

  val task = project.registerBuildImageTask(
    gcpRegion = extension.region,
    gcpProject = extension.project,
    gcpServiceAccount = extension.serviceAccount,
    repository = extension.artifactRegistry.repository,
    imageName = extension.artifactRegistry.imageName,
    baseImageReference = extension.jib.baseImageReference,
    classPath = project.files().apply {
      from(project.configurations.getByName("runtimeClasspath"))
      from(project.tasks.named("jar"))
    },
    mainClass = extension.jib.mainClass,
  )

  project.registerCreateNewRevisionTask(
    gcpRegion = extension.region,
    gcpProject = extension.project,
    gcpServiceAccount = extension.serviceAccount,
    serviceName = extension.cloudRun.service
  ).configure {
    it.dependsOn(task)
  }
}

abstract class LoudExtension(project: Project) {
  abstract val region: Property<String>
  abstract val project: Property<String>
  abstract val serviceAccount: Property<String>

  internal val artifactRegistry = project.objects.newInstance(ArtifactRegistry::class.java)
  fun artifactRegistry(block: Action<ArtifactRegistry>) {
    block.execute(artifactRegistry)
  }

  internal val jib = project.objects.newInstance(Jib::class.java)
  fun jib(block: Action<Jib>) {
    block.execute(jib)
  }

  internal val cloudRun = project.objects.newInstance(CloudRun::class.java)
  fun cloudRun(block: Action<CloudRun>) {
    block.execute(cloudRun)
  }
}

abstract class ArtifactRegistry {
  abstract val repository: Property<String>
  abstract val imageName: Property<String>
}

abstract class Jib {
  abstract val baseImageReference: Property<String>
  abstract val mainClass: Property<String>
}

abstract class CloudRun {
  abstract val service: Property<String>
}
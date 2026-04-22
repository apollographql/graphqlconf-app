package graphqlconf.app.misc

import kotlinx.serialization.Serializable

@Serializable
class Artifact(
  val groupId: String,
  val artifactId: String,
  val version: String,
  val spdxLicenses: List<License> = emptyList(),
  val unknownLicenses: List<License> = emptyList()
)

@Serializable
class License(val identifier: String? = null, val name: String? = null, val url: String)

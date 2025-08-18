import com.google.api.gax.core.FixedCredentialsProvider
import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.run.v2.Service
import com.google.cloud.run.v2.ServiceName
import com.google.cloud.run.v2.ServicesClient
import com.google.cloud.run.v2.ServicesSettings
import gratatouille.tasks.GTask
import java.io.ByteArrayInputStream
import java.time.ZoneId
import java.util.*
import kotlin.time.Clock
import kotlin.time.ExperimentalTime
import kotlin.time.toJavaInstant

@GTask
fun createNewRevision(
  gcpRegion: String,
  gcpProject: String,
  gcpServiceAccount: String,
  serviceName: String,
) {
  val serviceName = serviceName
  val servicesClient = ServicesClient.create(ServicesSettings.newBuilder()
    .setCredentialsProvider(
      GoogleCredentials.fromStream(
        ByteArrayInputStream(gcpServiceAccount.encodeToByteArray())
      ).let {
        FixedCredentialsProvider.create(it)
      }
    )
    .build())

  val fullName = ServiceName.of(gcpProject, gcpRegion, serviceName).toString()
  val existingService = servicesClient.getService(fullName)
  val newService = existingService.newBuilderForType()
    .setName(fullName)
    .setTemplate(
      existingService.template
        .toBuilder()
        .setRevision("$serviceName-${revision()}")
        .build()
    )
    .setInvokerIamDisabled(true)
    .build()

  servicesClient.updateServiceAsync(newService).get()

  servicesClient.close()
}

/**
 * We need to force something new or else no new revision is created
 */
@OptIn(ExperimentalTime::class)
private fun revision(): String {
  val now = Clock.System.now().toJavaInstant().atZone(ZoneId.of("UTC"))
  return String.format(
    Locale.ROOT,
    "%4d-%02d-%02d-%02d%02d%02d",
    now.year,
    now.monthValue,
    now.dayOfMonth,
    now.hour,
    now.minute,
    now.second
  )
}

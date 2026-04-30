import model.json
import model.schedSessionsRefresher
import model.schedSpeakersRefresher
import java.io.File

fun main(args: Array<String>) {
  File("src/main/resources/sessions.json").writeText(json.encodeToString(schedSessionsRefresher.refreshValue()))
  File("src/main/resources/speakers.json").writeText(json.encodeToString(schedSpeakersRefresher.refreshValue()))
}
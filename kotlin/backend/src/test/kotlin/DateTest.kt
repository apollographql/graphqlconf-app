import kotlin.test.Test
import kotlin.test.assertEquals

class DateTest {
  @Test
  fun dateParsingTest() {
    assertEquals("2025-09-08T08:00", dateFormat.parse("2025-09-08 08:00").toString())
  }
}
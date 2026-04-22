package graphqlconf.app

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.atDate
import kotlinx.datetime.format
import kotlinx.datetime.format.MonthNames
import kotlinx.datetime.format.Padding
import kotlinx.datetime.format.char

object DateTimeFormatting {
  private val timeFormat = LocalTime.Format {
    hour(padding = Padding.ZERO)
    char(':')
    minute(padding = Padding.ZERO)
  }

  private val dateFormat = LocalDate.Format {
    monthName(MonthNames.ENGLISH_FULL)
    char(' ')
    dayOfMonth()
  }

  private val monthFormat = LocalDate.Format {
    monthName(MonthNames.ENGLISH_FULL)
  }

  private val dateWithYearFormat = LocalDateTime.Format {
    monthName(MonthNames.ENGLISH_FULL)
    char(' ')
    day()
    chars(", ")
    year()
  }

  internal fun time(time: LocalTime): String = time.format(timeFormat)

  internal fun date(dateTime: LocalDateTime): String = date(dateTime.date)

  internal fun date(date: LocalDate): String = date.format(dateFormat)

  internal fun month(date: LocalDate): String = date.format(monthFormat)

  internal fun dateWithYear(dateTime: LocalDateTime): String = dateTime.format(dateWithYearFormat)

  internal fun timeToTime(start: LocalTime, end: LocalTime): String = "${time(start)} – ${time(end)}"

  internal fun dateAndTime(dateTime: LocalDateTime): String = "${date(dateTime)}, ${time(dateTime.time)}"

  internal fun dateAndTime(start: LocalDateTime, end: LocalDateTime): String =
    "${date(start)}, ${time(start.time)} – ${time(end.time)}"

}

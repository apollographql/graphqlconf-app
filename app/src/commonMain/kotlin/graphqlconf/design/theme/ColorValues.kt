package graphqlconf.design.theme

import androidx.compose.ui.graphics.Color

internal object ColorValues {
  val black100 = Color(0xFF19191C)
  val black90 = Color(0xE519191C)
  val black80 = Color(0xCC19191C)
  val black70 = Color(0xB219191C)
  val black60 = Color(0x9919191C)
  val black50 = Color(0x8019191C)
  val black40 = Color(0x6619191C)
  val black30 = Color(0x4D19191C)
  val black20 = Color(0x3319191C)
  val black15 = Color(0x2619191C)
  val black10 = Color(0x1A19191C)
  val black05 = Color(0x0D19191C)

  val white100 = Color(0xFFFFFFFF)
  val white90 = Color(0xE5FFFFFF)
  val white80 = Color(0xCCFFFFFF)
  val white70 = Color(0xB2FFFFFF)
  val white60 = Color(0x99FFFFFF)
  val white50 = Color(0x80FFFFFF)
  val white40 = Color(0x66FFFFFF)
  val white30 = Color(0x4DFFFFFF)
  val white20 = Color(0x33FFFFFF)
  val white15 = Color(0x26FFFFFF)
  val white10 = Color(0x1AFFFFFF)
  val white05 = Color(0x0DFFFFFF)

  val rhodamine = Color(0xFFE10098)
}

/**
 * From https://github.com/graphql/graphql.github.io/blob/a3d6819fbedd23b985fc05a37b8fb7722d3a517b/src/app/conf/2025/utils.ts#L4-L26
 */
private val eventTypeColors = mapOf(
   "breaks" to Color(0xff7DAA5E),
   "keynote sessions" to Color(0xff7e66cc),
   "lightning talks" to Color(0xff1a5b77),
   "session presentations" to Color(0xff5c2e75),
   "workshops" to Color(0xff4b5fc0),
   "unconference" to Color(0xff7e66cc),
   "api platform" to Color(0xff4e6e82),
   "backend" to Color(0xff36C1A0),
   "breaks & special events" to Color(0xff7DAA5E),
   "defies categorization" to Color(0xff894545),
   "developer experience" to Color(0xff6fc9af),
   "federation and composite schemas" to Color(0xffcbc749),
   "graphql clients" to Color(0xffca78fc),
   "graphql in production" to Color(0xffe4981f),
   "graphql security" to Color(0xffCC6BB0),
   "graphql spec" to Color(0xff6B73CC),
   "scaling" to Color(0xff8D8D8D),
   "frontend" to Color(0xff7F00FF),
   "documentation" to Color(0xffFA8072),
   "schema evolution" to Color(0xffD8BFD8),
   "security" to Color(0xff6495ED),
   "case studies" to Color(0xff894545),
   "federation and distributed systems" to Color(0xffFC8251),
)

internal fun eventColor(eventType: String): Color {
  return eventTypeColors.get(eventType.lowercase()) ?: Color(0xff6fc9af)
}
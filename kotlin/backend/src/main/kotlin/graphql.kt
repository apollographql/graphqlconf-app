@file:OptIn(ExperimentalSerializationApi::class)

import app.graphqlconf.supabase.SubmitFeedbackMutation
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.ast.GQLStringValue
import com.apollographql.apollo.ast.GQLValue
import com.apollographql.apollo.execution.Coercing
import com.apollographql.apollo.execution.ExternalValue
import com.apollographql.apollo.execution.StringCoercing
import com.apollographql.execution.annotation.GraphQLMutation
import com.apollographql.execution.annotation.GraphQLName
import com.apollographql.execution.annotation.GraphQLQuery
import com.apollographql.execution.annotation.GraphQLScalar
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.format.Padding
import kotlinx.datetime.format.char
import kotlinx.serialization.ExperimentalSerializationApi
import model.JsonSession
import model.JsonSocialUrl
import model.JsonSpeaker
import model.allSessions
import model.allSpeakers

@GraphQLScalar(StringCoercing::class)
typealias ID = String

@GraphQLScalar(LocalDateTimeCoercing::class)
@GraphQLName("LocalDateTime")
typealias GraphQLLocalDateTime = LocalDateTime

@GraphQLScalar(LocalDateCoercing::class)
@GraphQLName("LocalDate")
typealias GraphQLLocalDate = LocalDate

@GraphQLScalar(LocalTimeCoercing::class)
@GraphQLName("LocalTime")
typealias GraphQLLocalTime = LocalTime

internal val dateFormat = LocalDateTime.Format {
  year()
  char('-')
  monthNumber(padding = Padding.ZERO)
  char('-')
  day()
  char(' ')
  hour(padding = Padding.ZERO)
  char(':')
  minute(padding = Padding.ZERO)
}

object LocalDateTimeCoercing : Coercing<LocalDateTime> {
  override fun serialize(internalValue: LocalDateTime): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalDateTime {
    return LocalDateTime.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalDateTime {
    return LocalDateTime.parse((value as GQLStringValue).value)
  }
}

object LocalDateCoercing : Coercing<LocalDate> {
  override fun serialize(internalValue: LocalDate): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalDate {
    return LocalDate.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalDate {
    return LocalDate.parse((value as GQLStringValue).value)
  }
}

object LocalTimeCoercing : Coercing<LocalTime> {
  override fun serialize(internalValue: LocalTime): ExternalValue {
    return internalValue.toString()
  }

  override fun deserialize(value: ExternalValue): LocalTime {
    return LocalTime.parse((value as String))
  }

  override fun parseLiteral(value: GQLValue): LocalTime {
    return LocalTime.parse((value as GQLStringValue).value)
  }
}

class Room(
  val name: String,
  val rank: Int,
  val floor: Int,
)

@GraphQLQuery
class Query {
  fun sessions(): List<Session> {
    return allSessions.map {
      it.toGraphQLSession()
    }
  }

  /**
   * null if the session doesn't exist.
   */
  fun session(id: ID): Session? {
    return allSessions.find { it.id == id }?.toGraphQLSession()
  }

  /**
   * Returns a list of ScheduleItems to be displayed in the UI.
   *
   * ScheduleItems introduce day headers as well as time headers.
   * They also make sure the sessions are sorted by start time/room and group them by time slot.
   *
   * A time slot is a manually configured time range. It usually corresponds to a 30-minute slot where 3 sessions can happen in parallel.
   * Because some sessions are shorter, several of them may fit into a single time slot.
   *
   * ScheduleItems also filter out some
   */
  fun scheduleItems(): List<ScheduleItem> {
    return buildItems(sessions())
  }

  fun speakers(): List<Speaker> {
    val speakersWithSessions =
      allSessions.flatMap { it.speakers }.map { it.username }.distinct().toSet()
    return allSpeakers.filter { speakersWithSessions.contains(it.username) }.map {
      it.toGraphQLSpeaker()
    }.sortedBy { it.name }
  }

  /**
   * null if the speaker doesn't exist.
   */
  fun speaker(id: ID): Speaker? {
    return allSpeakers.find { it.username == id }?.toGraphQLSpeaker()
  }

  val timezone = "Europe/Amsterdam"
}

class Session(
  val title: String,
  val description: String,
  override val start: GraphQLLocalDateTime,
  override val end: GraphQLLocalDateTime,
  val event_type: String,
  val event_subtype: String,
  @Deprecated("Use room instead")
  val venue: String?,
  val id: ID,
  private val speakerUsernames: List<String>
) : ScheduleItem {
  val speakers: List<Speaker>
    get() {
      return allSpeakers.filter {
        it.username in speakerUsernames
      }.map {
        it.toGraphQLSpeaker()
      }
    }

  @Suppress("DEPRECATION")
  val room: Room? = venue?.toRoom()
}

private fun JsonSpeaker.toGraphQLSpeaker(): Speaker {
  return Speaker(
    username = username,
    company = company,
    position = position,
    name = name,
    about = about,
    location = location,
    url = url,
    avatar = avatar,
    years = years,
    socialUrls = socialurls.map { it.toGraphQLSocialUrls() },
  )
}

fun JsonSocialUrl.toGraphQLSocialUrls(): SocialUrl {
  return SocialUrl(
    service = service.toGraphQLSocialService(),
    url = url,
  )
}

enum class SocialService {
  Instagram, Twitter, LinkedIn, Facebook, Other
}

private fun String.toGraphQLSocialService(): SocialService {
  return when (this) {
    "Twitter" -> SocialService.Twitter
    "LinkedIn" -> SocialService.LinkedIn
    "Instagram" -> SocialService.Instagram
    "Facebook" -> SocialService.Facebook
    else -> SocialService.Other
  }
}

class SocialUrl(
  val service: SocialService,
  val url: String
)

@Suppress("DEPRECATION")
class Speaker(
  @Deprecated("Use id instead")
  val username: String,
  val company: String,
  val position: String,
  val name: String,
  val about: String,
  val location: String,
  val url: String,
  avatar: String,
  val years: List<Int>,
  val socialUrls: List<SocialUrl>,
) {
  val id: ID = username
  val avatar = avatar.fixIfNeeded()

  fun sessions(): List<Session> {
    return allSessions.filter {
      it.speakers.any { it.username == username }
    }.map {
      it.toGraphQLSession()
    }
  }

  private fun String.fixIfNeeded(): String {
    return if (startsWith("//")) {
      "https:$this"
    } else {
      this
    }
  }
}

private fun JsonSession.toGraphQLSession(): Session {
  return Session(
    id = id,
    title = name,
    description = description,
    start = dateFormat.parse(event_start),
    end = dateFormat.parse(event_end),
    event_type = event_type,
    event_subtype = event_subtype,
    venue = venue,
    speakerUsernames = speakers.map { it.username },
  )
}

sealed interface ScheduleItem {
  val start: GraphQLLocalDateTime
  val end: GraphQLLocalDateTime
}

class DayHeader(
  override val start: GraphQLLocalDateTime,
  override val end: GraphQLLocalDateTime,
  val title: String
) : ScheduleItem

class TimeHeader(
  override val start: GraphQLLocalDateTime,
  override val end: GraphQLLocalDateTime,
) : ScheduleItem

private fun String.toRoom(): Room? {
  return when (this) {
    "Grote Zaal - 2nd Floor" -> Room(
      name = "Grote Zaal",
      rank = 0,
      floor = 2
    )

    "IJzaal - 5th Floor" -> Room(
      name = "IJzaal",
      rank = 1,
      floor = 5
    )

    "Studio - 5th Floor" -> Room(
      name = "Studio",
      rank = 2,
      floor = 5
    )

    "BG Foyer - Ground Floor" -> Room(
      name = "BG foyer",
      rank = 3,
      floor = 0
    )

    "Foyer Grote Zaal - 2nd Floor" -> Room(
      name = "Foyer Grote Zaal",
      rank = 4,
      floor = 2
    )

    "Workspace - 2nd Floor" -> Room(
      name = "Workspace",
      rank = 5,
      floor = 2
    )

    else -> null
  }
}

fun buildItems(sessions: List<Session>): List<ScheduleItem> {
  val items = mutableListOf<ScheduleItem>()

  var lastDate: LocalDate? = null
  var dayIndex = 1
  /**
   * List of time slots created by the notebook and then tweaked manually.
   */
  listOf(
    "2026-05-19 08:00" to "2026-05-19 09:00", // Registration + Badge Pick-up
    "2026-05-19 09:00" to "2026-05-19 10:15", // Keynote Sessions To Be Announced
    "2026-05-19 10:15" to "2026-05-19 10:35", // Break
    "2026-05-19 10:35" to "2026-05-19 11:10", // "Big Graphs, Tiny Contexts: Dev Tools for Agents - Stephen Spalding & Kavitha Srinivasan, Netflix"
    "2026-05-19 11:10" to "2026-05-19 11:45", // "React Server Components Vs. GraphQL - Jordan Eldredge, Meta"
    "2026-05-19 11:45" to "2026-05-19 12:00", // "Shopify's Breadth-First Bet: Rethinking GraphQL Execution - Greg MacWilliam, Shopify"
    "2026-05-19 12:00" to "2026-05-19 12:10", // "GraphQL: The Internal Agentic API - Christopher Chedeau, Meta"
    "2026-05-19 12:10" to "2026-05-19 13:25", // Lunch
    "2026-05-19 13:25" to "2026-05-19 14:00", // "The State of GraphQL Agent Skills - Dale Seo, Apollo GraphQL"
    "2026-05-19 14:00" to "2026-05-19 14:25", // "Schema Composition Without Federation - Matt Mahoney, Meta"
    "2026-05-19 14:25" to "2026-05-19 14:35", // "Making GraphQL Fun for the Backend Too - Stephen Haberman, Homebound"
    "2026-05-19 14:35" to "2026-05-19 14:50", // "Bringing GraphQL Natively To Relational Databases With AI - Shashank Gugnani, Oracle"
    "2026-05-19 14:50" to "2026-05-19 15:10", // "Breaking up With Inputs (Without Breaking Your Users) - Laurin Quast, The Guild"
    "2026-05-19 15:10" to "2026-05-19 15:35", // "Connecting LLMs To GraphQL With Schema-Aware Embeddings - Thore Koritzius, Self"
    "2026-05-19 15:35" to "2026-05-19 15:55", // Break
    "2026-05-19 15:55" to "2026-05-19 16:30", // "Simplifying MCP Tool Sprawl With GraphQL - Roy Derks, IBM"
    "2026-05-19 16:30" to "2026-05-19 17:05", // "Shifting Instagram Development Towards Monolith Server Via Federated Schema - Xiao Han, Chi Chan, Lisa Watkins & Anirudh Padmarao, Meta"
    "2026-05-19 17:05" to "2026-05-20 08:00", // "Understanding Your Graph, One Hash at a Time - Jens Neuse, WunderGraph"
    "2026-05-20 08:00" to "2026-05-20 09:00", // Registration + Badge Pick-up
    "2026-05-20 09:00" to "2026-05-20 10:00", // GraphQL All Hands Meeting
    "2026-05-20 10:00" to "2026-05-20 10:15", // Break
    "2026-05-20 10:15" to "2026-05-20 10:30", // "When GraphQL Gets Expensive: Performance & Cost Patterns in Production Serverless Architectures - Harpreet Siddhu, AWS Community Builder & Shravanth Gowda Venkatesh, Independent Researcher"
    "2026-05-20 10:30" to "2026-05-20 10:50", // "Resolvers Everywhere: Rethinking Client and Server Boundaries in GraphQL - Janette Cheng, Meta"
    "2026-05-20 10:50" to "2026-05-20 11:25", // "GraphQL Meets LLMs & Agents: Building Production AI at Starbucks Scale - Sharon Gorla, Starbucks"
    "2026-05-20 11:25" to "2026-05-20 12:00", // "Semantic Introspection - Pascal Senn, ChilliCream"
    "2026-05-20 12:00" to "2026-05-20 12:25", // "GraphQL Embeddings: AI-Powered Dynamic Operations From Schema To IDE - Michael Watson, Self"
    "2026-05-20 12:25" to "2026-05-20 13:40", // Lunch
    "2026-05-20 13:40" to "2026-05-20 14:15", // "A GraphQL-inspired Orchestration Language for the AI Era - Martijn Walraven, Apollo"
    "2026-05-20 14:15" to "2026-05-20 14:30", // "Governing the AI-Graph: Observability and Security for LLM-Generated Queries - Rajeshwari Sah, Apple Inc"
    "2026-05-20 14:30" to "2026-05-20 14:50", // "Inside a Modern GraphQL Compiler - Alec Aivazis, Arista Networks"
    "2026-05-20 14:50" to "2026-05-20 15:15", // "GraphQL Data Mocking at Scale With LLMs and @generateMock - Michael Rebello, Airbnb"
    "2026-05-20 15:15" to "2026-05-20 15:35", // Break
    "2026-05-20 15:35" to "2026-05-20 16:10", // "Observability for a Multi-Tenant GraphQL Gateway at Scale - Vickey Yeh, Airbnb"
    "2026-05-20 16:10" to "2026-05-20 16:45", // "From Query to Conversation: GraphQL as an AI Interface Layer - Hugh Nguyen, Ben Golub, Adam Conrad & Kewei Qu, Meta"
    "2026-05-20 16:45" to "2026-05-20 17:00", // "Keynote: GraphQL’s Next Chapter: Progress, Proposals, and Participation - Kewei Qu, Software Engineer, Meta; Pascal Senn, COO, Chillicream; Mark Larah, Group Tech Lead, Yelp"
    "2026-05-20 17:00" to "2026-05-20 17:15", // Keynote Sessions To Be Announced
    "2026-05-21 09:30" to "2026-05-20 16:30", // WG day
    ).forEach {
    val start = dateFormat.parse(it.first)
    val end = dateFormat.parse(it.second)

    val date = start.date
    if (lastDate == null || lastDate != date) {
      items.add(DayHeader(start, end, "Day $dayIndex"))
      lastDate = date
      dayIndex++
    }
    items.add(TimeHeader(start, end))
    items.addAll(
      sessions.filter {
        it.start in start..<end
      }.sortedBy {
        it.start.toString() + (it.room?.rank ?: Int.MAX_VALUE).toString()
      }
    )
  }

  return items
}

class FeedbackInput(
  val userId: String,
  val sessionId: String,
  val rating: Int,
  val comment: String,
)

private val apolloClient = ApolloClient.Builder()
  .serverUrl("https://ejuwwdxlemkjxfjrrseb.supabase.co/graphql/v1")
  .addHttpHeader("apiKey", "sb_publishable_5E7EbV547Wu9kX9GRYiV_Q_q7oHk0CD")
  .build()

@GraphQLMutation
class Mutation {
  suspend fun submitFeedback(feedbackInput: FeedbackInput): Boolean {

    val response = apolloClient.mutation(SubmitFeedbackMutation(
      feedbackInput.userId,
      feedbackInput.sessionId,
      feedbackInput.rating,
      feedbackInput.comment
    )).execute()

    response.exception.let {
      if (it != null) {
        println("There was an exception while saving the feedback")
        it.printStackTrace()
        return false
      }
    }
    response.errors.orEmpty().let {
      if (it.isNotEmpty()) {
        println("There was an exception while saving the feedback: $it")
        return false
      }
    }

    return true
  }
}


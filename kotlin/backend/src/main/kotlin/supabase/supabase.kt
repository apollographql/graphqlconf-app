package supabase

import kotlinx.serialization.Serializable

@Serializable
class SupabaseVote(
  val user_id: String,
  val session_id: String,
  val vote: Int
)

@Serializable
class SupabaseComment(
  val user_id: String,
  val session_id: String,
  val comment: String
)
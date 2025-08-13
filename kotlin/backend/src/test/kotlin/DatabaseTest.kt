import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.runBlocking
import supabase.SupabaseVote
import kotlin.test.Ignore
import kotlin.test.Test

class DatabaseTest {
  @Test
  @Ignore
  fun test(): Unit = runBlocking {
    supabase.from("votes").upsert(SupabaseVote("user1", "session1", 2))
    supabase.from("votes").upsert(SupabaseVote("user1", "session2", 3))
    supabase.from("votes").upsert(SupabaseVote("user1", "session1", 1))
  }
}


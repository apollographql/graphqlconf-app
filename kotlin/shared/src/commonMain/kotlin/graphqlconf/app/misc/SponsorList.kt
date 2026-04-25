package graphqlconf.app.misc

import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import graphqlconf.api.GetSponsorGroupsQuery
import graphqlconf.app.apolloClient
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
fun SponsorList() {
  val listState = rememberLazyListState()
  val state = remember {
    apolloClient.query(GetSponsorGroupsQuery()).toFlow()
  }.collectAsStateWithLifecycle(null)

  ApolloWrapper(state.value) { data ->
    val uriHandler = LocalUriHandler.current
    val isDark = isSystemInDarkTheme()
    LazyColumn(
      modifier = Modifier.fillMaxSize(),
      state = listState,
      contentPadding = PaddingValues(vertical = 16.dp),
    ) {
      data.sponsorGroups.forEach { group ->
        item(key = "header-${group.name}") {
          Text(
            text = group.name,
            style = GraphqlConfTheme.typography.h3,
            color = GraphqlConfTheme.colors.text,
            textAlign = TextAlign.Center,
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 8.dp),
          )
        }
        items(group.sponsors, key = { "${group.name}-${it.name}" }) { sponsor ->
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 8.dp)
              .height(96.dp)
              .clickable { uriHandler.openUri(sponsor.url) },
            contentAlignment = Alignment.Center,
          ) {
            AsyncImage(
              model = if (isDark) sponsor.logoDark else sponsor.logoLight,
              contentDescription = sponsor.name,
              contentScale = ContentScale.Fit,
              modifier = Modifier.fillMaxSize(),
            )
          }
        }
      }
    }
  }
}

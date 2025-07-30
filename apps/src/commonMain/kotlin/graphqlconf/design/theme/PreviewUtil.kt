package graphqlconf.design.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PreviewHelper(
  content: @Composable ColumnScope.() -> Unit,
) {
  Column {
    GraphqlConfTheme(darkTheme = false) {
      PreviewColumn(content)
    }
    GraphqlConfTheme(darkTheme = true) {
      PreviewColumn(content)
    }
  }
}

@Composable
private fun PreviewColumn(
  content: @Composable ColumnScope.() -> Unit,
) {
  Column(
    modifier = Modifier.background(GraphqlConfTheme.colors.mainBackground),
    verticalArrangement = Arrangement.spacedBy(8.dp),
  ) {
    content()
  }
}

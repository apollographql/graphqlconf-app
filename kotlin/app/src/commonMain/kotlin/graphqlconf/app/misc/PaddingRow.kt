package graphqlconf.app.misc

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.GraphqlConfTheme

@Composable
internal fun PaddingRow(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) {
  Row(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp)
  ) {
    VerticalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
    content()
    VerticalDivider(color = GraphqlConfTheme.colors.secondaryDimmed, thickness = 1.dp)
  }
}

package graphqlconf.design.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.eventColor

@Composable
fun Badges(eventTypes: List<String>, modifier: Modifier = Modifier) {
  FlowRow(modifier = modifier) {
    eventTypes.distinct().forEach { eventType ->
      val color = eventColor(eventType)
      if (color != null) {
        Text(
          text =  eventType.uppercase(),
          color = GraphqlConfTheme.colors.primaryText,
          style = GraphqlConfTheme.typography.badge,
          modifier = Modifier.border(1.dp, color = color).background(color.copy(alpha = 0.3f)).padding(4.dp)
        )
        Spacer(modifier = Modifier.padding(horizontal = 4.dp))
      }
    }
  }
}
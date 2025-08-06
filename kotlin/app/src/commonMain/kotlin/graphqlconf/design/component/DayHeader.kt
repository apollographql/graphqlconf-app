package graphqlconf.design.component

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.GraphqlConfTheme
import kotlinx.datetime.LocalDate

@Composable
fun DayHeader(date: LocalDate, title: String) {
  Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
    Column() {
      Text(
        text = "SEP",
        color = ColorValues.secondaryBase,
        style = GraphqlConfTheme.typography.badge,
      )
      Text(
        text = date.day.toString(),
        color = ColorValues.white100,
        style = GraphqlConfTheme.typography.h1,
      )
    }
    Spacer(modifier = Modifier.width(16.dp))
    Text(
      text = title,
      color = ColorValues.white100,
      style = GraphqlConfTheme.typography.h2,
    )
  }
}
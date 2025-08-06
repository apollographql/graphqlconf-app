package graphqlconf.design.component

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.snapping.SnapPosition
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment.Companion.Bottom
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Alignment.Companion.Top
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import graphqlconf.design.theme.ColorValues
import graphqlconf.design.theme.CommitMono
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.Typography
import graphqlconf_app.app.generated.resources.CommitMono_400_Regular
import graphqlconf_app.app.generated.resources.Res
import kotlinx.datetime.LocalDate

@Composable
fun DayHeader(date: LocalDate, title: String) {
  Column(modifier = Modifier.padding(vertical = 32.dp).fillMaxWidth()) {
    Box(modifier = Modifier.background(ColorValues.primaryBase).fillMaxWidth()) {
      Row(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        Column {
          Text(
            text = "SEP",
            color = ColorValues.secondaryBase,
            style = GraphqlConfTheme.typography.badge.copy(fontSize = 16.sp),
            modifier = Modifier.align(CenterHorizontally)
          )
          Text(
            text = date.day.toString(),
            color = ColorValues.white100,
            style = GraphqlConfTheme.typography.h1,
          )
        }
      }
      Text(
        text = title,
        color = ColorValues.white100,
        style = GraphqlConfTheme.typography.h2,
        modifier = Modifier.align(Center)
      )
    }
  }
}
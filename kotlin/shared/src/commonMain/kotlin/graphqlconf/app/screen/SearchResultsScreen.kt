package graphqlconf.app.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import graphqlconf.design.component.TopMenuButton
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.shared.generated.resources.Res
import graphqlconf_app.shared.generated.resources.arrow_left
import graphqlconf_app.shared.generated.resources.search_placeholder
import org.jetbrains.compose.resources.stringResource

@Composable
fun SearchResultsScreen(onBack: () -> Unit) {
  var query by rememberSaveable { mutableStateOf("") }
  val focusRequester = remember { FocusRequester() }

  LaunchedEffect(Unit) {
    focusRequester.requestFocus()
  }

  Column(modifier = Modifier.fillMaxSize().background(GraphqlConfTheme.colors.background)) {
    Row(
      modifier = Modifier
        .height(48.dp)
        .fillMaxWidth()
        .background(GraphqlConfTheme.colors.surface),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      TopMenuButton(
        icon = Res.drawable.arrow_left,
        onClick = onBack,
      )
      Box(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
        BasicTextField(
          value = query,
          onValueChange = { query = it },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().focusRequester(focusRequester),
          textStyle = GraphqlConfTheme.typography.bodyMedium.copy(color = GraphqlConfTheme.colors.text),
          cursorBrush = SolidColor(GraphqlConfTheme.colors.text),
          keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
          decorationBox = { innerTextField ->
            if (query.isEmpty()) {
              Text(
                text = stringResource(Res.string.search_placeholder),
                style = GraphqlConfTheme.typography.bodyMedium,
                color = GraphqlConfTheme.colors.textDimmed,
              )
            }
            innerTextField()
          },
        )
      }
    }
    HorizontalDivider(
      thickness = 1.dp,
      color = GraphqlConfTheme.colors.textDimmed,
    )
  }
}

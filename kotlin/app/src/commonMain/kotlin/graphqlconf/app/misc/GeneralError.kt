package graphqlconf.app.misc

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.oh_no
import org.jetbrains.compose.resources.stringResource

@Composable
fun GeneralError(message: String?) {
  println("Oh no$message")
  Box(modifier = Modifier.fillMaxSize().padding(32.dp)) {
    Text(
      text = stringResource(Res.string.oh_no),
      textAlign = TextAlign.Center,
      style = GraphqlConfTheme.typography.h1,
      color = GraphqlConfTheme.colors.text,
      modifier = Modifier.align(Alignment.Center)
    )
  }
}
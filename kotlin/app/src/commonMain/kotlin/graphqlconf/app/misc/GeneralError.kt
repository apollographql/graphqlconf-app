package graphqlconf.app.misc

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.oh_no
import org.jetbrains.compose.resources.stringResource

@Composable
fun GeneralError(message: String?) {
  Box(modifier = Modifier.fillMaxSize()) {
    Text(
      text = stringResource(Res.string.oh_no),
      style = GraphqlConfTheme.typography.h1,
      color = GraphqlConfTheme.colors.primaryText,
      modifier = Modifier.align(Alignment.Center)
    )
  }
}
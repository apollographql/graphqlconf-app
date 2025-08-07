package graphqlconf.design.component

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import graphqlconf.design.theme.GraphqlConfTheme
import graphqlconf.design.theme.PreviewHelper
import graphqlconf_app.app.generated.resources.Res
import graphqlconf_app.app.generated.resources.arrow_left
import graphqlconf_app.app.generated.resources.users
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
private fun TopMenuButtonImpl(
    icon: DrawableResource,
    contentDescription: String,
    interactionModifier: Modifier,
    backgroundColor: Color,
    iconColor: Color,
    modifier: Modifier = Modifier,
) {
    Icon(
        modifier = modifier
            .padding(6.dp)
            .size(36.dp)
            .clip(CircleShape)
            .then(interactionModifier)
            .background(backgroundColor)
            .padding(6.dp),
        painter = painterResource(icon),
        contentDescription = contentDescription,
        tint = iconColor,
    )
}

/**
 * A toggleable top menu button with selection state.
 */
@Composable
fun TopMenuButton(
    icon: DrawableResource,
    selected: Boolean = false,
    onToggle: (Boolean) -> Unit,
    contentDescription: String,
    modifier: Modifier = Modifier,
) {
    val backgroundColor by animateColorAsState(
        if (selected) GraphqlConfTheme.colors.background
        else Color.Transparent
    )
    val iconColor by animateColorAsState(
        if (selected) GraphqlConfTheme.colors.textDimmed
        else GraphqlConfTheme.colors.text
    )

    TopMenuButtonImpl(
        icon = icon,
        contentDescription = contentDescription,
        modifier = modifier,
        interactionModifier = Modifier.toggleable(
            value = selected,
            enabled = true,
            onValueChange = onToggle,
            role = Role.Switch,
        ),
        backgroundColor = backgroundColor,
        iconColor = iconColor,
    )
}

/**
 * A clickable top menu button with no selection state.
 */
@Composable
fun TopMenuButton(
    icon: DrawableResource,
    onClick: () -> Unit,
    contentDescription: String,
    modifier: Modifier = Modifier,
) {
    TopMenuButtonImpl(
        icon = icon,
        contentDescription = contentDescription,
        modifier = modifier,
        interactionModifier = Modifier.clickable(onClick = onClick),
        backgroundColor = Color.Transparent,
        iconColor = GraphqlConfTheme.colors.text,
    )
}

@Preview
@Composable
internal fun TopMenuButtonPreview() {
    PreviewHelper {
        Row {
            var state1 by remember { mutableStateOf(false) }
            TopMenuButton(Res.drawable.arrow_left, state1, { state1 = it }, "Bookmark")

            var state2 by remember { mutableStateOf(true) }
            TopMenuButton(Res.drawable.users, state2, { state2 = it }, "Users")
        }
    }
}

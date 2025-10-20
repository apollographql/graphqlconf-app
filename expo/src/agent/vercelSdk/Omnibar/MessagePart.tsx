import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { ThemedText } from "@/components/themed-text";
import { isShowEmbedToolUIPart, ShowEmbedPart } from "./ShowEmbedTool";

export function MessagePart({
  part,
}: {
  part: UIMessagePart<UIDataTypes, UITools>;
}) {
  if (part.type === "text") {
    return <ThemedText>{part.text}</ThemedText>;
  }
  if (isShowEmbedToolUIPart(part)) {
    return <ShowEmbedPart part={part} />;
  }
}

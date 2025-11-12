import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { ThemedText } from "@/components/ThemedText";
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

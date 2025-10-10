import { DocumentNode, FragmentDefinitionNode } from "graphql";

export function firstFragment(doc: DocumentNode): FragmentDefinitionNode {
  const fragmentDef = doc.definitions.find(
    (d): d is FragmentDefinitionNode => d.kind === "FragmentDefinition"
  );
  if (!fragmentDef) {
    throw new Error("No fragment definition found in document");
  }
  return fragmentDef;
}

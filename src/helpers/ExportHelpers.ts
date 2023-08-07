import { FileContent, TsNode } from "../types";

export const exportToConsole = (
  files: FileContent[],
  nodes: Map<string, TsNode[]>,
) => {
  const fileMap = new Map(files.map((f) => [f.path, f]));
  const output = [...nodes.entries()]
    .filter(([, nodes]) => nodes.length > 0)
    .flatMap(([path, nodes]) => {
      const file = fileMap.get(path)!;
      const getContent = (node: TsNode) =>
        file.content.substring(node.getStart(), node.getEnd());
      return nodes.map((node) => ({
        file,
        getContent,
        node,
        content: getContent(node),
      }));
    });

  console.log("%cNode Dump", "color: crimson; font-size:32px");
  console.log("Node Dump Data", output, { input: { files, nodes } });
};

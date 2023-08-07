import { isNotOneOf, isOneOf } from "../helpers/CollectionHelpers";
import { getFileExtension } from "../helpers/FileHelpers";
import { FileExplorer } from "./FileExplorer";

const isRelevantFileExtension = isOneOf<string | null>([
  "js",
  "jsx",
  "mjs",
  "ts",
  "tsx",
]);

const isBlockedFolder = isNotOneOf(["node_modules", "build", "dist"]);

export const codeFileExplorer = new FileExplorer({
  maxDepth: 10,
  isAllowedDirectoryName: (name) =>
    name.startsWith(".") || isBlockedFolder(name),
  isAllowedFileName: (name) => isRelevantFileExtension(getFileExtension(name)),
});

import { FileContent, TsNode } from "../types";
import { ast, query } from "../../tsquery/src";

export const handleSearch = async (
  queryText: string,
  files: FileContent[],
): Promise<TsNode[]> => {
  console.time("handleSearch");
  const output = files.flatMap((file) =>
    query(ast(file.content, file.path), queryText),
  );
  console.timeEnd("handleSearch");
  return output;
};

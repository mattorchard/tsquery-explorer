import { FileContent } from "../types";
import { ast, query } from "../../tsquery/src";

export const handleSearch = async (queryText: string, files: FileContent[]) => {
  console.time("handleSearch");
  const output = new Map(
    files.map((file) => [
      file.path,
      query(ast(file.content, file.path), queryText),
    ]),
  );
  console.timeEnd("handleSearch");
  return output;
};

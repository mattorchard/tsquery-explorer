import { FileContent } from "../types";
import { ast, query } from "../../tsquery/src";

export const handleSearch = async (queryText: string, files: FileContent[]) => {
  console.time("handleSearch");
  const output = new Map(
    files.map((file) => {
      const codeAst = ast(file.content, file.path);
      return [
        file.path,
        queryText ? query(codeAst, queryText) : codeAst.getChildren(),
      ];
    }),
  );
  console.timeEnd("handleSearch");
  return output;
};

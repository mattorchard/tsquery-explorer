import { FileContent } from "../types";
import { ast, query, parse } from "../../tsquery/src";

export const handleSearch = async (rawQuery: string, files: FileContent[]) => {
  console.time("handleSearch");
  const selector = rawQuery ? parse(rawQuery.replaceAll(/\r?\n/g, "")) : null;
  const output = new Map(
    files.map((file) => {
      const codeAst = ast(file.content, file.path);
      return [
        file.path,
        selector ? query(codeAst, selector) : codeAst.getChildren(),
      ];
    }),
  );
  console.timeEnd("handleSearch");
  return output;
};

import { FileContent } from "../types";
import { ast, query, parse, ScriptKind } from "../../tsquery/src";

export const handleSearch = async (rawQuery: string, files: FileContent[]) => {
  const timerKey = `handleSearch::${rawQuery}`;
  console.time(timerKey);
  const selector = rawQuery ? parse(rawQuery.replaceAll(/\r?\n/g, "")) : null;
  const output = new Map(
    files.map((file) => {
      const codeAst = ast(
        file.content,
        file.path,
        file.name.endsWith(".tsx") ? ScriptKind.TSX : ScriptKind.TS,
      );
      return [
        file.path,
        selector ? query(codeAst, selector) : codeAst.getChildren(),
      ];
    }),
  );
  console.timeEnd(timerKey);
  return output;
};

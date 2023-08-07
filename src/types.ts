export type { Node as TsNode } from "typescript";

export type { Properties as TsNodeProperties } from "../tsquery/src/types.ts";

export type FileContent = {
  path: string;
  name: string;
  content: string;
  byteSize: number;
};

export type IndexRange = {
  startIndex: number;
  endIndex: number;
};

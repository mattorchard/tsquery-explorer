export type { Node as TsNode } from "typescript";

export type FileContent = {
  path: string;
  name: string;
  content: string;
  byteSize: number;
};

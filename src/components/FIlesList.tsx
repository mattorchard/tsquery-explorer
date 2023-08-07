import { Component, For } from "solid-js";
import { FileContent } from "../types";

export const FilesList: Component<{ files: FileContent[] }> = (props) => {
  return (
    <ol>
      <For each={props.files}>{(file) => <li>{file.name}</li>}</For>
    </ol>
  );
};

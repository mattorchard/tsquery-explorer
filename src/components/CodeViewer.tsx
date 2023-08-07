import * as monaco from "monaco-editor";
import { Component, createEffect, onMount, onCleanup } from "solid-js";
import { IndexRange } from "../types";

export const CodeViewer: Component<{ code: string; highlight: IndexRange }> = (
  props,
) => {
  let monacoContainer: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    editor = monaco.editor.create(monacoContainer, monacoOptions);
  });

  onCleanup(() => {
    editor.dispose();
  });

  createEffect(() => {
    editor.setValue(props.code);
  });

  createEffect(() => {
    const model = editor.getModel();
    if (!model) return;
    const startPosition = model.getPositionAt(props.highlight.startIndex);
    const endPosition = model.getPositionAt(props.highlight.endIndex);
    editor.createDecorationsCollection([
      {
        range: new monaco.Range(
          startPosition.lineNumber,
          startPosition.column,
          endPosition.lineNumber,
          endPosition.column,
        ),
        options: {
          isWholeLine: false,
          inlineClassName: "debug",
        },
      },
    ]);
  });

  return (
    <div class="h-full">
      <div ref={monacoContainer!} class="h-full" />
    </div>
  );
};

const monacoOptions: monaco.editor.IEditorOverrideServices = {
  value: "",
  language: "typescript",
  theme: "vs-dark",
  readOnly: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

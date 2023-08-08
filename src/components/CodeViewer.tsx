import * as monaco from "monaco-editor";
import { Component, createEffect, onMount, onCleanup } from "solid-js";
import { IndexRange } from "../types";

export const CodeViewer: Component<{ code: string; highlight: IndexRange }> = (
  props,
) => {
  let monacoContainer: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let decorations: monaco.editor.IEditorDecorationsCollection;

  onMount(() => {
    editor = monaco.editor.create(monacoContainer, monacoOptions);
    decorations = editor.createDecorationsCollection([]);
  });

  onCleanup(() => {
    decorations.clear();
    editor.dispose();
  });

  createEffect(() => {
    editor.setValue(props.code);
  });

  createEffect(() => {
    const model = editor.getModel();
    decorations.clear();
    if (!model || !props.highlight.endIndex) return;
    const startPosition = model.getPositionAt(props.highlight.startIndex);
    const endPosition = model.getPositionAt(props.highlight.endIndex);
    decorations.set([
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
    editor.revealLineInCenter(startPosition.lineNumber);
  });

  return (
    <div class="h-full">
      <div ref={monacoContainer!} class="h-full" />
    </div>
  );
};

monaco.editor.defineTheme("tsquery", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#020617",
  },
});

// Important Bit #3: Tell typescript to use 'react' for jsx files.
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.React,
});

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  value: "",
  language: "typescript",
  theme: "tsquery",
  readOnly: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
};

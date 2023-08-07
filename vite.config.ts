import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    solid(),
    // @ts-ignore
    monacoEditorPlugin.default({}),
  ],
});

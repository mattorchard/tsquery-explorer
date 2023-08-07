import { For, createEffect, createSignal } from "solid-js";
import { FileContent, TsNode } from "./types";
import { NodeViewer } from "./components/NodeViewer";
import { codeFileExplorer } from "./utils/CodeFileExplorer";
import { readBlob } from "./helpers/FileHelpers";
import { FilesList } from "./components/FIlesList";
import { QueryInput } from "./components/QueryInput";
import { handleSearch } from "./helpers/SearchHelpers";

// ImportDeclaration:has(StringLiteral[text=react])
function App() {
  const [query, setQuery] = createSignal("");
  const [files, setFiles] = createSignal<FileContent[]>([]);
  const [nodes, setNodes] = createSignal<TsNode[]>([]);

  createEffect(() => {
    if (!query()) setNodes([]);
    else handleSearch(query(), files()).then(setNodes);
  });

  const handleOpenFolder = async () => {
    setFiles(await grabCodeFilesFromFolder());
  };

  return (
    <div class="p-4">
      <header>
        <QueryInput onChange={setQuery} />
      </header>
      <div class="flex">
        <div>
          <button
            onClick={handleOpenFolder}
            class="rounded-md bg-cyan-600 p-1 px-2"
          >
            Open Folder
          </button>
          <FilesList files={files()} />
        </div>

        <For each={nodes()}>{(node) => <NodeViewer node={node} />}</For>
      </div>
    </div>
  );
}

const grabCodeFilesFromFolder = async (): Promise<FileContent[]> => {
  const rootDirectory = await window.showDirectoryPicker();
  const handleMap = await codeFileExplorer.explore(rootDirectory);
  if (
    handleMap.size > MAX_FILE_COUNT_BEFORE_APPROVAL &&
    !window.confirm(`Found ${handleMap.size} files, proceed?`)
  ) {
    throw new Error(`User cancelled open folder request`);
  }
  return await Promise.all(
    [...handleMap.entries()].map(
      async ([path, handle]): Promise<FileContent> => {
        const file = await handle.getFile();
        return {
          path,
          name: handle.name,
          byteSize: file.size,
          content: await readBlob(file),
        };
      },
    ),
  );
};

const MAX_FILE_COUNT_BEFORE_APPROVAL = 100;

export default App;

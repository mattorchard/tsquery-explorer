import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import { FileContent, TsNode } from "./types";
import { NodeViewer } from "./components/NodeViewer";
import { codeFileExplorer } from "./utils/CodeFileExplorer";
import { readBlob } from "./helpers/FileHelpers";
import { QueryInput } from "./components/QueryInput";
import { handleSearch } from "./helpers/SearchHelpers";
import { CodeViewer } from "./components/CodeViewer";

function App() {
  const [query, setQuery] = createSignal(defaultQuery);
  const [selectedFile, setSelectedFile] = createSignal<FileContent | null>(
    null,
  );
  const [files, setFiles] = createSignal<FileContent[]>([]);
  const [allNodes, setAllNodes] = createSignal<Map<string, TsNode[]>>(
    new Map(),
  );
  const [indexRange, setIndexRange] = createSignal({
    startIndex: 0,
    endIndex: 0,
  });

  const selectedNodes = createMemo(
    () => allNodes().get(selectedFile()?.path!) ?? [],
  );

  createEffect(() => {
    // Todo: Proper async handling
    if (!query()) setAllNodes(new Map());
    else handleSearch(query(), files()).then(setAllNodes);
  });

  const handleOpenFolder = async () => {
    setFiles(await grabCodeFilesFromFolder());
  };

  return (
    <div
      class="max-h-screen min-h-screen overflow-hidden"
      style={{ display: "grid", "grid-template-rows": "auto 1fr" }}
    >
      <header>
        <QueryInput defaultValue={query()} onChange={setQuery} />
      </header>
      <main
        style={{ display: "grid", "grid-template-columns": "240px 240px  1fr" }}
        class="overflow-hidden"
      >
        <section class="overflow-auto">
          <button
            onClick={handleOpenFolder}
            class="rounded-md bg-cyan-600 p-1 px-2"
          >
            Open Folder
          </button>
          <ol>
            <For each={files()}>
              {(file) => (
                <li>
                  <button
                    onClick={() => setSelectedFile(file)}
                    classList={{
                      "text-white/30": !allNodes().get(file.path)?.length,
                    }}
                  >
                    {file.name}
                  </button>
                </li>
              )}
            </For>
          </ol>
        </section>
        <section>
          <For each={selectedNodes()}>
            {(node) => (
              <NodeViewer node={node} onPointer={setIndexRange} depth={0} />
            )}
          </For>
          <Show when={selectedFile() && selectedNodes().length === 0}>
            <p>No results in {selectedFile()?.path}</p>
          </Show>
        </section>
        <section>
          <CodeViewer
            code={selectedFile()?.content ?? ""}
            highlight={indexRange()}
          />
        </section>
      </main>
    </div>
  );
}

const defaultQuery = "ImportDeclaration:has(StringLiteral[text=react])";

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

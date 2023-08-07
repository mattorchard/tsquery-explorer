import {
  For,
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";
import { FileContent, TsNode } from "./types";
import { NodeViewer } from "./components/NodeViewer";
import { codeFileExplorer } from "./utils/CodeFileExplorer";
import { readBlob } from "./helpers/FileHelpers";
import { QueryInput } from "./components/QueryInput";
import { handleSearch } from "./helpers/SearchHelpers";
import { CodeViewer } from "./components/CodeViewer";
import { ProjectRepository } from "./utils/ProjectRepo";
import { unwrap } from "solid-js/store";
import { exportToConsole } from "./helpers/ExportHelpers";

function App() {
  const [lastProject] = createResource(ProjectRepository.getLastProject);
  const [query, setQuery] = createSignal(
    localStorage.getItem("DEBUG_QUERY") || "",
  );
  const [selectedFile, setSelectedFile] = createSignal<FileContent | null>(
    null,
  );
  const [files, setFiles] = createSignal<FileContent[]>([]);
  const [allNodes, setAllNodes] = createSignal(new Map<string, TsNode[]>());
  const [indexRange, setIndexRange] = createSignal({
    startIndex: 0,
    endIndex: 0,
  });

  const selectedNodes = createMemo(
    () => allNodes().get(selectedFile()?.path!) ?? [],
  );

  createEffect(() => {
    // Todo: Proper async handling
    handleSearch(query(), files()).then(setAllNodes);
  });

  const handleOpenFolder = async () => {
    const rootDirectory = await window.showDirectoryPicker();
    void ProjectRepository.saveProject({ root: rootDirectory }).catch((error) =>
      console.error("Failed to save project", error),
    );
    setFiles(await grabCodeFilesFromFolder(rootDirectory));
  };

  const handleRestoreLastProject = async () => {
    const project = lastProject();
    if (!project) return;
    setFiles(await grabCodeFilesFromFolder(project.root));
  };

  const handleDumpToConsole = () => {
    exportToConsole(unwrap(files()), unwrap(allNodes()));
  };

  return (
    <div
      class="max-h-screen min-h-screen gap-2 overflow-hidden"
      style={{ display: "grid", "grid-template-rows": "auto 1fr" }}
    >
      <header class="flex border-b-8 border-slate-800">
        <QueryInput defaultValue={query()} onChange={setQuery} />
        <button onClick={handleDumpToConsole}>Dump to console</button>
      </header>
      <main
        style={{ display: "grid", "grid-template-columns": "240px 480px  1fr" }}
        class="overflow-hidden"
      >
        <section class="overflow-x-auto overflow-y-scroll">
          <div class="sticky top-0 inline-flex gap-1 overflow-hidden rounded-md">
            <button onClick={handleOpenFolder} class=" bg-cyan-600 p-1 px-2">
              {files().length ? "Change folder" : "Open Folder"}
            </button>
            <Show when={!files().length && lastProject()}>
              <button
                class="bg-cyan-600 p-1 px-2"
                onClick={handleRestoreLastProject}
              >
                Restore ({lastProject()!.root.name})
              </button>
            </Show>
          </div>
          <ol>
            <For each={files()}>
              {(file) => (
                <li>
                  <button
                    onClick={() => setSelectedFile(file)}
                    class="w-full px-2 text-start transition-colors hover:bg-slate-800"
                    classList={{
                      "text-white/30": !!(
                        query() && !allNodes().get(file.path)?.length
                      ),
                      "bg-cyan-700 hover:bg-cyan-600": file === selectedFile(),
                    }}
                  >
                    {file.name}
                  </button>
                </li>
              )}
            </For>
          </ol>
        </section>
        <section class="overflow-x-auto overflow-y-scroll">
          <For each={selectedNodes()}>
            {(node) => (
              <NodeViewer node={node} onPointer={setIndexRange} depth={0} />
            )}
          </For>
          <Show when={selectedFile() && !selectedNodes().length}>
            <p>No results in {selectedFile()?.path}</p>
          </Show>
        </section>
        <section class="overflow-hidden">
          <CodeViewer
            code={selectedFile()?.content ?? ""}
            highlight={indexRange()}
          />
        </section>
      </main>
    </div>
  );
}

const grabCodeFilesFromFolder = async (
  rootDirectory: FileSystemDirectoryHandle,
): Promise<FileContent[]> => {
  await rootDirectory.requestPermission({ mode: "read" });
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

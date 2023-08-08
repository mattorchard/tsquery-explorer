import {
  For,
  ParentComponent,
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
import { NonIdealState } from "./components/NonIdealState";
import { FileItem } from "./components/FileItem";
import { createRegexSafe } from "./helpers/RegexHelpers";

const savedQueryKey = "TSQUERY_SAVED_QUERY_V1";

function App() {
  const [lastProject] = createResource(ProjectRepository.getLastProject);
  const [query, setQuery] = createSignal(
    localStorage.getItem(savedQueryKey) || "",
  );
  const [fileFilter, setFileFilter] = createSignal("");
  const [selectedFile, setSelectedFile] = createSignal<FileContent | null>(
    null,
  );
  const [allFiles, setAllFiles] = createSignal<FileContent[]>([]);
  const [allNodes, setAllNodes] = createSignal(new Map<string, TsNode[]>());
  const [indexRange, setIndexRange] = createSignal({
    startIndex: 0,
    endIndex: 0,
  });

  const files = createMemo(() => {
    const pattern = fileFilter() ? createRegexSafe(fileFilter()) : null;
    if (!pattern) return allFiles();
    return allFiles().filter((file) => !pattern.test(file.path));
  });

  const sortedFiles = createMemo(() => {
    const allNodesMap = allNodes();
    if (allNodesMap.size === 0) return files();
    return [...files()].sort((a, b) => {
      const hasSomeA = allNodesMap.get(a.path)?.length;
      const hasSomeB = allNodesMap.get(b.path)?.length;
      if (hasSomeA && !hasSomeB) return -1;
      if (!hasSomeA && hasSomeB) return 1;
      return a.path.localeCompare(b.path);
    });
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
    setSelectedFile(null);
    setAllFiles(await grabCodeFilesFromFolder(rootDirectory));
  };

  const handleRestoreLastProject = async () => {
    const project = lastProject();
    if (!project) return;
    setSelectedFile(null);
    setAllFiles(await grabCodeFilesFromFolder(project.root));
  };

  const handleDumpToConsole = () => {
    exportToConsole(unwrap(files()), unwrap(allNodes()));
  };

  const handleSaveQuery = () => {
    localStorage.setItem(savedQueryKey, query());
  };

  const handleSetFileFilter = () => {
    setFileFilter(window.prompt("File filter") ?? "");
  };

  const controlButtonClazz =
    "h-full bg-slate-800 px-4 py-3 transition-colors hover:bg-slate-700 active:bg-slate-900";

  return (
    <div
      class="max-h-screen min-h-screen overflow-hidden"
      style={{ display: "grid", "grid-template-rows": "auto 1fr" }}
    >
      <header
        class="items-start border-b-8 border-slate-800"
        style={{ display: "grid", "grid-template-columns": "320px 1fr auto" }}
      >
        <div class="px-4 py-2">
          <h1 class="select-none text-4xl opacity-60">
            TSQuery
            <br />
            Explorer
          </h1>
        </div>
        <QueryInput defaultValue={query()} onChange={setQuery} />
        <div class="grid grid-cols-2">
          <button
            type="button"
            class={controlButtonClazz}
            onClick={handleOpenFolder}
          >
            Choose different folder
          </button>
          <button
            type="button"
            class={controlButtonClazz}
            onClick={handleSetFileFilter}
          >
            Set file exclusion
          </button>
          <button
            type="button"
            class={controlButtonClazz}
            onClick={handleDumpToConsole}
          >
            Dump to console
          </button>
          <button
            type="button"
            class={controlButtonClazz}
            onClick={handleSaveQuery}
          >
            Save query
          </button>
        </div>
      </header>

      <Show
        when={files().length}
        fallback={
          <>
            <div class="center-on-screen">
              <div
                class="cursor-pointer transition-all hover:translate-y-[-.25rem] hover:text-cyan-200"
                onClick={handleOpenFolder}
              >
                <NonIdealState illustration="folder" title="Open a folder">
                  To get started: open a folder containing <br /> some{" "}
                  <InlineCode>js</InlineCode> or
                  <InlineCode>ts</InlineCode> files.
                </NonIdealState>
              </div>
            </div>
            <Show when={lastProject()}>
              <button
                type="button"
                class="absolute bottom-6 left-[50%] translate-x-[-50%] rounded-md bg-cyan-600 p-2 transition-colors hover:bg-cyan-500 active:bg-cyan-700"
                onClick={handleRestoreLastProject}
              >
                Reopen previous folder
              </button>
            </Show>
          </>
        }
      >
        <main
          style={{
            display: "grid",
            "grid-template-columns": "320px 480px 1fr",
          }}
          class="overflow-hidden"
        >
          <section class="overflow-x-auto overflow-y-scroll">
            <ol>
              <For each={sortedFiles()}>
                {(file) => (
                  <FileItem
                    file={file}
                    isSelected={file === selectedFile()}
                    ignoreCount={!query()}
                    count={allNodes().get(file.path)?.length ?? 0}
                    onClick={() => setSelectedFile(file)}
                  />
                )}
              </For>
            </ol>
          </section>
          <section
            class="overflow-x-auto overflow-y-scroll"
            data-tree-walk-root={true}
          >
            <For
              each={selectedNodes()}
              fallback={
                selectedFile() && (
                  <div class="flex h-full">
                    <NonIdealState illustration="magnifier" title="No results">
                      No matches for query in:{" "}
                      <InlineCode>{selectedFile()!.path}</InlineCode>
                    </NonIdealState>
                  </div>
                )
              }
            >
              {(node) => (
                <NodeViewer node={node} onPointer={setIndexRange} depth={0} />
              )}
            </For>
          </section>
          <section class="overflow-hidden">
            <Show
              when={selectedFile()}
              fallback={
                <div class="center-on-screen">
                  <NonIdealState illustration="code" title="Select a file">
                    Once you select a file,
                    <br />
                    the code will appear here.
                  </NonIdealState>
                </div>
              }
            >
              <CodeViewer
                code={selectedFile()!.content ?? ""}
                highlight={indexRange()}
              />
            </Show>
          </section>
        </main>
      </Show>
    </div>
  );
}

const InlineCode: ParentComponent = (props) => (
  <code class="inlin rounded-md bg-black/30 px-2 py-1">{props.children}</code>
);

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

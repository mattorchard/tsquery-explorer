type DirHandle = FileSystemDirectoryHandle;
type FileHandle = FileSystemFileHandle;

interface FileSystemOptions {
  maxDepth: number;
  delimiter: string;
  isAllowedFileName: (name: string) => boolean;
  isAllowedDirectoryName: (name: string) => boolean;
}

const defaultOptions: FileSystemOptions = {
  maxDepth: 5,
  delimiter: "/",
  isAllowedFileName: () => true,
  isAllowedDirectoryName: () => true,
};

export class FileExplorer {
  private readonly options: FileSystemOptions;

  constructor(options?: Partial<FileSystemOptions>) {
    this.options = { ...defaultOptions, ...options };
  }

  public async explore(rootDirectory: DirHandle) {
    const state: ExploreState = {
      seenDirectories: new Set(),
      fileHandleMap: new Map(),
      warnings: [],
    };
    await this.exploreInternal(rootDirectory, "", state);
    if (state.warnings.length > 0) {
      console.warn("FileExplorer warnings", state.warnings);
    }
    return state.fileHandleMap;
  }

  private async exploreInternal(
    directory: DirHandle,
    preceedingPath: string,
    state: ExploreState,
    depth = 0,
  ): Promise<void> {
    if (state.seenDirectories.has(directory)) return;
    state.seenDirectories.add(directory);

    if (depth > this.options.maxDepth) {
      state.warnings.push({ kind: "max-depth", path: preceedingPath });
      return;
    }

    for await (const handle of directory.values()) {
      const cleanName = handle.name.replaceAll(this.options.delimiter, " ");
      const path = `${preceedingPath}${this.options.delimiter}${cleanName}`;
      switch (handle.kind) {
        case "directory":
          if (this.options.isAllowedDirectoryName(directory.name)) {
            await this.exploreInternal(handle, path, state, depth + 1);
          } else {
            state.warnings.push({ kind: "disallowed-folder", path });
          }
          break;
        case "file":
          if (this.options.isAllowedFileName(handle.name)) {
            state.fileHandleMap.set(path, handle);
          } else {
            state.warnings.push({ kind: "disallowed-file", path });
          }
          break;
        default:
          console.warn(`Unhandled directory kind`, { handle, path });
          break;
      }
    }
  }
}

interface ExploreState {
  seenDirectories: Set<DirHandle>;
  fileHandleMap: Map<string, FileHandle>;
  warnings: FileSystemWarning[];
}
type FileSystemWarning = {
  kind: "max-depth" | "disallowed-folder" | "disallowed-file";
  path: string;
};

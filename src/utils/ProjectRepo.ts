import { openDB, DBSchema } from "idb";

interface ProjectRepositorySchema extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
}
const dbPromise = openDB<ProjectRepositorySchema>("PROJECT_REPO", 1, {
  upgrade(db) {
    db.createObjectStore("projects");
  },
});

const LAST_PROJECT_KEY = "LAST_PROJECT_KEY_V1";

const getLastProject = async () => {
  const db = await dbPromise;
  return (await db.get("projects", LAST_PROJECT_KEY)) ?? null;
};

const saveProject = async (project: Project) => {
  const db = await dbPromise;
  console.debug("Saving project", project);
  return await db.put("projects", project, LAST_PROJECT_KEY);
};

export const ProjectRepository = {
  getLastProject,
  saveProject,
};

interface Project {
  root: FileSystemDirectoryHandle;
}

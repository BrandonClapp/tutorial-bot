import * as fileSystem from "fs";
const fs = fileSystem.promises;

export function fileExists(path: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      await fs.access(path);
      resolve(true);
    } catch (e) {
      resolve(false);
    }
  });
}

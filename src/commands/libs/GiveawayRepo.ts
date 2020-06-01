import * as fileSystem from "fs";
const fs = fileSystem.promises;

import { fileExists } from "../../utility/fileExists";

export interface Giveaway {
  id: string;
  expiration: number;
  message: string;
}

export namespace GiveawayRepo {
  const dataDir = __dirname + "/../../../data";
  let cache: Giveaway[] = [];

  export function getAll() {
    return cache;
  }

  export async function loadCache() {
    cache = await readAll();
  }

  export async function save(giveaway: Giveaway): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const fileName = `${dataDir}/giveaway-${giveaway.id}.json`;
      try {
        await fs.writeFile(fileName, JSON.stringify(giveaway));
      } catch (e) {
        console.log("Could not write file", fileName);
        reject(e);
      }

      cache.push(giveaway);
      return resolve();
    });
  }

  export async function get(id: string): Promise<Giveaway> {
    return new Promise(async (resolve, reject) => {
      // First check to see if there is a cached giveaway
      const cached = cache.find((g) => g.id === id);
      if (cached) {
        return resolve(cached);
      }

      const fileName = `${dataDir}/giveaway-${id}.json`;

      if (await fileExists(fileName)) {
        try {
          const content = await fs.readFile(fileName);
          const giveaway = JSON.parse(content.toString()) as Giveaway;
          cache.push(giveaway);
          return resolve(giveaway);
        } catch (err) {
          console.log("Could not read the file", fileName);
          return reject(err);
        }
      }

      return resolve(null);
    });
  }

  export async function remove(id: string): Promise<void> {
    return new Promise(async (resolve) => {
      // Check if the id is on disk
      const fileName = `${dataDir}/giveaway-${id}.json`;
      if (await fileExists(fileName)) {
        await fs.unlink(fileName);
      }

      cache = cache.filter((g) => g.id !== id);
      return resolve();
    });
  }

  function readAll(): Promise<Giveaway[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const files = await fs.readdir(dataDir);

        const giveawayFiles = files.filter(
          (file) => file.startsWith("giveaway") && file.endsWith(".json")
        );

        const all = await Promise.all(
          giveawayFiles.map(async (file) => {
            let content = await fs.readFile(`${dataDir}/${file}`);
            return JSON.parse(content.toString()) as Giveaway;
          })
        );

        return resolve(all);
      } catch (err) {
        console.log("Could not read the directory", dataDir);
        return reject(err);
      }
    });
  }
}

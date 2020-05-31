import * as fs from "fs";

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

  // TODO: add the giveaway to our cache
  export async function save(giveaway: Giveaway): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileName = `${dataDir}/giveaway-${giveaway.id}.json`;
      fs.writeFile(fileName, JSON.stringify(giveaway), (err) => {
        if (err) {
          console.log("Could not write the file", fileName);
          return reject(err);
        }

        cache.push(giveaway);
        return resolve();
      });
    });
  }

  export async function get(id: string): Promise<Giveaway> {
    return new Promise((resolve, reject) => {
      // First check to see if there is a cached giveaway
      const cached = cache.find((g) => g.id === id);
      if (cached) {
        return resolve(cached);
      }

      const fileName = `${dataDir}/giveaway-${id}.json`;

      if (fs.existsSync(fileName)) {
        fs.readFile(fileName, (err, content) => {
          if (err) {
            console.log("Could not read the file", fileName);
            return reject(err);
          }
          const giveaway = JSON.parse(content.toString()) as Giveaway;
          cache.push(giveaway);
          return resolve(giveaway);
        });
      }

      return resolve(null);
    });
  }

  function readAll(): Promise<Giveaway[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(dataDir, (err, files: string[]) => {
        if (err) {
          console.log("Could not read the directory", dataDir);
          return reject(err);
        }

        const giveawayFiles = files.filter(
          (file) => file.startsWith("giveaway") && file.endsWith(".json")
        );

        const all = giveawayFiles.map((file) => {
          let content = fs.readFileSync(`${dataDir}/${file}`);
          return JSON.parse(content.toString()) as Giveaway;
        });

        return resolve(all);
      });
    });
  }
}

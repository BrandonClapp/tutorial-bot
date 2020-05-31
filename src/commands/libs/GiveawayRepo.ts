import * as fs from "fs";

export interface Giveaway {
  id: string;
  expiration: number;
  message: string;
}

export class GiveawayRepo {
  private dataDir = __dirname + "/../../../data";

  public async save(giveaway: Giveaway): Promise<void> {
    return new Promise((resolve) => {
      const fileName = `${this.dataDir}/giveaway-${giveaway.id}.json`;
      fs.writeFile(fileName, JSON.stringify(giveaway), (err) => {
        if (err) {
          console.log("Could not write file: " + fileName);
          throw err;
        }
      });
      resolve();
    });
  }

  public async getAll(): Promise<Giveaway[]> {
    return new Promise((resolve) => {
      fs.readdir(this.dataDir, (err, files: string[]) => {
        if (err) {
          console.log("Could not read data directory.");
          throw err;
        }
        const giveawaysFiles = files.filter(
          (file) => file.startsWith("giveaway") && file.endsWith(".json")
        );

        const all = giveawaysFiles.map((file) => {
          // Different than require(), due to caching
          let content = fs.readFileSync(`${this.dataDir}/${file}`);
          return JSON.parse(content.toString()) as Giveaway;
        });

        resolve(all);
      });
    });
  }

  public async get(id: string): Promise<Giveaway> {
    return new Promise((resolve, reject) => {
      const fileName = `${this.dataDir}/giveaway-${id}.json`;

      if (fs.existsSync(fileName)) {
        fs.readFile(fileName, (err, content) => {
          if (err) {
            console.log("Could not read file: " + fileName);
            reject(err);
          }
          const giveaway = JSON.parse(content.toString()) as Giveaway;
          resolve(giveaway);
        });
      }

      return null;
    });
  }
}

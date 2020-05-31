import * as fs from "fs";

export interface Giveaway {
  id: string;
  expiration: number;
  message: string;
}

export class GiveawayRepo {
  private dataDir = __dirname + "/../../../data";

  public async save(giveaway: Giveaway): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileName = `${this.dataDir}/giveaway-${giveaway.id}.json`;
      fs.writeFile(fileName, JSON.stringify(giveaway), (err) => {
        if (err) {
          console.log("Could not write the file", fileName);
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  public async get(id: string): Promise<Giveaway> {
    return new Promise((resolve, reject) => {
      const fileName = `${this.dataDir}/giveaway-${id}.json`;

      if (fs.existsSync(fileName)) {
        fs.readFile(fileName, (err, content) => {
          if (err) {
            console.log("Could not read the file", fileName);
            reject(err);
          }
          const giveaway = JSON.parse(content.toString()) as Giveaway;
          resolve(giveaway);
        });
      }

      resolve(null);
    });
  }
}

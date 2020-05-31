export interface Giveaway {
  id: string;
  expiration: number;
  message: string;
}

export class GiveawayRepo {
  private dataDir = __dirname + "/../../../data";

  public async save(giveaway: Giveaway): Promise<void> {}

  public async get(id: string): Promise<Giveaway> {
    return null;
  }
}

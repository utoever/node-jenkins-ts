import * as middleware from "./middleware";
import * as utils from "./utils";

export class Queue {

  constructor(private readonly jenkins: any) {
  }

  async list(opts: any): Promise<any> {
    opts = utils.parse([...arguments]);
    this.jenkins._log(["debug", "queue", "list"], opts);

    const req: { name: string; path: string } = {
      name: "queue.list",
      path: "/queue/api/json",
    };

    utils.options(req, opts);

    return this.jenkins._get(req, middleware.bodyItem("items"));
  }

  /**
   * Get an individual queue item
   */
  async item(number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "number");

    this.jenkins._log(["debug", "queue", "item"], opts);

    const req: { name: string; path: string; params: { number: number } } = {
      name: "queue.item",
      path: "/queue/item/{number}/api/json",
      params: {
        number: opts.number,
      },
    };

    utils.options(req, opts);

    if (!opts.number) {
      throw this.jenkins._err(new Error("number required"), req);
    }

    return await this.jenkins._get(req, middleware.body);
  }

  /**
   * Cancel queue item
   */
  async cancel(number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "number");

    this.jenkins._log(["debug", "queue", "cancel"], opts);

    const req: { name: string; path?: string; params?: { number: number } } = {
      name: "queue.cancel",
    };

    utils.options(req, opts);

    try {
      if (!opts.number) throw new Error("number required");

      req.path = "/queue/item/{number}/cancelQueue";
      req.params = { number: opts.number };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.require302("failed to cancel: " + opts.number),
      middleware.empty
    );
  }

}

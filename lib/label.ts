import * as middleware from "./middleware";
import * as utils from "./utils";

export class Label {
  jenkins: any;

  constructor(jenkins: any) {
    this.jenkins = jenkins;
  }

  async get(name: string, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "name");

    this.jenkins._log(["debug", "label", "get"], opts);

    const req: { name: string; path?: string; params?: { name: string } } = {
      name: "label.get",
    };

    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/label/{name}/api/json";
      req.params = {
        name: opts.name,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._get(req, middleware.body);
  }

}

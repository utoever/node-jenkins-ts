import * as middleware from "./middleware";
import * as utils from "./utils";

class Plugin {
  jenkins: any;

  constructor(jenkins: any) {
    this.jenkins = jenkins;
  }

  /**
   * List plugins
   */
  async list(opts: any): Promise<any> {
    opts = utils.parse([...arguments]);

    // depth of 0 is useless for plugins
    if (typeof opts.depth === "undefined") opts.depth = 1;

    this.jenkins._log(["debug", "plugin", "list"], opts);

    const req = {
      name: "plugin.list",
      path: "/pluginManager/api/json",
    };

    utils.options(req, opts);

    return await this.jenkins._get(req, middleware.bodyItem("plugins"));
  }
}

export { Plugin };

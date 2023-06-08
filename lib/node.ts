import * as middleware from "./middleware";
import * as utils from "./utils";

export class Node {

  constructor(private readonly jenkins: any) {
  }

  /**
   * Get or update config
   */
  async config(name: string, xml: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "xml");
    this.jenkins._log(["debug", "node", "config"], opts);
    const req: any = { name: "node.config" };

    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/config.xml";
      req.params = {
        name: opts.name === "master" ? "(master)" : opts.name,
      };

      if (opts.xml) {
        if (opts.name === "master") {
          throw new Error("master not supported");
        }

        req.method = "POST";
        req.headers = { "content-type": "text/xml; charset=utf-8" };
        req.body = Buffer.from(opts.xml);
      } else {
        req.method = "GET";
      }
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._request(
      req,
      middleware.notFound("node " + opts.name),
      (ctx: any, next: any) => {
        if (ctx.err || opts.xml) return middleware.empty(ctx, next);

        next(false, ctx.res.body.toString("utf8"));
      }
    );
  }

  /**
   * Create node
   */
  async create(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");

    opts.type = opts.type || "hudson.slaves.DumbSlave$DescriptorImpl";
    opts.retentionStrategy = opts.retentionStrategy || {
      "stapler-class": "hudson.slaves.RetentionStrategy$Always",
    };
    opts.nodeProperties = opts.nodeProperties || {
      "stapler-class-bag": "true",
    };
    opts.launcher = opts.launcher || {
      "stapler-class": "hudson.slaves.JNLPLauncher",
    };
    opts.numExecutors = opts.hasOwnProperty("numExecutors")
      ? opts.numExecutors
      : 2;
    opts.remoteFS = opts.remoteFS || "/var/lib/jenkins";
    opts.mode = opts.mode || (opts.exclusive ? "EXCLUSIVE" : "NORMAL");

    this.jenkins._log(["debug", "node", "create"], opts);

    const req: any = { name: "node.create" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/doCreateItem";
      req.query.name = opts.name;
      req.query.type = opts.type;
      req.query.json = JSON.stringify({
        name: opts.name,
        nodeDescription: opts.nodeDescription,
        numExecutors: opts.numExecutors,
        remoteFS: opts.remoteFS,
        labelString: opts.labelString,
        mode: opts.mode,
        type: opts.type,
        retentionStrategy: opts.retentionStrategy,
        nodeProperties: opts.nodeProperties,
        launcher: opts.launcher,
      });
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.require302("failed to create: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Destroy node
   */
  async destroy(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "node", "destroy"], opts);
    const req: any = { name: "node.destroy" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/doDelete";
      req.params = { name: opts.name };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to delete: " + opts.name),
      middleware.empty
    );
  }

  // FIXME
  async delete(...args: any[]): Promise<any> {
    // FIXME
    return await this.destroy(args ? args[0] : '');
  }

  /**
   * Disconnect node call
   */
  async doDisconnect(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "node", "doDisconnect"], opts);
    const req: any = { name: "node.doDisconnect" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/doDisconnect";
      req.params = { name: opts.name };
      req.query.offlineMessage = opts.message || "";
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to disconnect: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Toggle offline
   */
  async toggleOffline(name: string, message: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "message");
    this.jenkins._log(["debug", "node", "toggleOffline"], opts);
    const req: any = { name: "node.toggleOffline" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/toggleOffline";
      req.params = { name: opts.name };
      req.query.offlineMessage = opts.message || "";
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to toggle offline: " + opts.name),
      middleware.empty
    );
  }

  /**
 * Change offline message
 */
  async changeOfflineCause(name: string, message: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "message");
    opts.message = opts.message || "";
    this.jenkins._log(["debug", "node", "changeOfflineCause"], opts);
    const req: any = { name: "node.changeOfflineCause" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/changeOfflineCause";
      req.params = { name: opts.name };
      req.type = "form";
      req.body = {
        offlineMessage: opts.message,
        json: JSON.stringify({
          offlineMessage: opts.message,
        }),
        Submit: "Update reason",
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to update offline message: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Disconnect node
   */
  async disconnect(name: string, message: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "message");
    this.jenkins._log(["debug", "node", "disconnect"], opts);

    if (!opts.name) {
      throw this.jenkins._err("name required", { name: "node.disconnect" });
    }

    const node = await this.get(opts.name);
    if (node && node.offline) {
      await this.toggleOffline(opts.name, opts.message);
      return;
    }

    await this.doDisconnect(opts.name, opts.message);
  }

  /**
   * Disable node
   */
  async disable(name: string, message: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "message");
    this.jenkins._log(["debug", "node", "disable"], opts);
    if (!opts.name) {
      throw this.jenkins._err("name required", { name: "node.disable" });
    }

    const node = await this.get(opts.name);

    if (node && node.temporarilyOffline) {
      if (node.offlineCauseReason !== opts.message) {
        await this.changeOfflineCause(opts.name, opts.message);
      }

      return;
    }

    await this.toggleOffline(opts.name, opts.message);
  }

  /**
   * Enable node
   */
  async enable(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "node", "enable"], opts);

    if (!opts.name) {
      throw this.jenkins._err("name required", { name: "node.enable" });
    }

    const node = await this.get(opts.name);
    if (node.temporarilyOffline) {
      await this.toggleOffline(opts.name,"");
    }
  }

  /**
   * Node exists
   */
  async exists(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "build", "exists"], opts);
    const req: any = { name: "node.exists" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/api/json";
      req.params = {
        name: opts.name === "master" ? "(master)" : opts.name,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._head(req, middleware.exists);
  }

  /**
   * Node details
   */
  async get(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "node", "get"], opts);
    const req: any = { name: "node.get" };
    utils.options(req, opts);

    try {
      if (!opts.name) throw new Error("name required");

      req.path = "/computer/{name}/api/json";
      req.params = {
        name: opts.name === "master" ? "(master)" : opts.name,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._get(
      req,
      middleware.notFound(opts.name),
      middleware.body
    );
  }

  /**
   * List nodes
   */
  async list(opts?: any): Promise<any> {
    opts = utils.parse([...arguments]);
    this.jenkins._log(["debug", "node", "list"], opts);
    const req: any = {
      name: "node.list",
      path: "/computer/api/json",
    };

    utils.options(req, opts);

    if (opts.full === true) {
      return await this.jenkins._get(req, middleware.body);
    } else {
      return await this.jenkins._get(req, middleware.bodyItem("computer"));
    }
  }

}
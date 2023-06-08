import * as middleware from './middleware';
import * as utils from './utils';

export class View {

  constructor(private readonly jenkins: any) {
  }

  /**
   * Create new view
   */
  async create(name: string, type: string, opts: any) {
    opts = utils.parse([...arguments], "name", "type");
    if (opts.name && !opts.type) opts.type = "list";

    this.jenkins._log(["debug", "view", "create"], opts);

    const req: any = { name: "view.create" };
    utils.options(req, opts);
    const shortcuts = {
      list: "hudson.model.ListView",
      my: "hudson.model.MyView",
      type: ''
    };

    try {
      const folder = utils.folderPath(opts.name);
      // FIXME
      // const mode: string = shortcuts[opts.type] || opts.type;
      const mode: string = opts.type;

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.type) throw new Error("type required");

      req.path = "{dir}/createView";
      req.type = "form";
      req.params = { dir: folder.dir() };
      req.body = {
        name: folder.name(),
        mode: mode,
        json: JSON.stringify({
          name: folder.name(),
          mode: mode,
        }),
      };
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
   * Config list view
   */
  async config(name: string, xml: string, opts: any) {
    opts = utils.parse([...arguments], "name", "xml");

    this.jenkins._log(["debug", "view", "config"], opts);

    const req: any = {
      path: "{dir}/view/{name}/config.xml",
      name: "view.config",
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");

      req.params = { dir: folder.dir(), name: folder.name() };

      if (opts.xml) {
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
      middleware.notFound("view " + opts.name),
      (ctx: any, next: any) => {
        if (ctx.err || opts.xml) return middleware.empty(ctx, next);

        next(false, ctx.res.body.toString("utf8"));
      }
    );
  }

  /**
   * Destroy view
   */
  async destroy(args: any[], opts: any) {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "view", "destroy"], opts);
    const req: any = { name: "view.destroy" };
    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      req.path = "{dir}/view/{name}/doDelete";
      req.params = { dir: folder.dir(), name: folder.name() };
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

  // async delete(...args: any[]) {
  //   return await this.destroy(...args);
  // }

  /**
   * View exists
   */
  async exists(name: string, opts: any) {
    opts = utils.parse([...arguments], "name");

    this.jenkins._log(["debug", "view", "exists"], opts);

    const req: any = { name: "view.exists" };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");

      req.path = "{dir}/view/{name}/api/json";
      req.params = { dir: folder.dir(), name: folder.name() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._head(req, middleware.exists);
  }

  /**
   * View details
   */
  async get(name: string, opts: any) {
    opts = utils.parse([...arguments], "name");

    this.jenkins._log(["debug", "view", "get"], opts);

    const req: any = { name: "view.get" };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");

      req.path = "{dir}/view/{name}/api/json";
      req.params = { dir: folder.dir(), name: folder.name() };
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
   * List views
   */
  async list(name: string, opts: any) {
    opts = utils.parse([...arguments], "name");

    this.jenkins._log(["debug", "view", "list"], opts);

    const req: any = {
      name: "view.list",
      path: "{folder}/api/json",
    };

    try {
      const folder = utils.folderPath(opts.name);

      req.params = { folder: folder.path() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    utils.options(req, opts);

    return await this.jenkins._get(
      req,
      (ctx: any, next: any) => {
        if (ctx.err) return next();

        if (!ctx.res.body || !Array.isArray(ctx.res.body.views)) {
          ctx.err = new Error("returned bad data");
        }

        next();
      },
      middleware.bodyItem("views")
    );
  }

  /**
   * Add job
   */
  async add(name: string, job: string, opts: any) {
    opts = utils.parse([...arguments], "name", "job");

    this.jenkins._log(["debug", "view", "add"], opts);

    const req: any = {
      path: "{dir}/view/{name}/addJobToView",
      query: { name: opts.job },
      type: "form",
      name: "view.add",
      body: {},
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.job) throw new Error("job required");

      req.params = { dir: folder.dir(), name: folder.name() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(req, middleware.empty);
  }

  /**
   * Remove job
   */
  async remove(name: string, job: string, opts: any) {
    opts = utils.parse([...arguments], "name", "job");

    this.jenkins._log(["debug", "view", "remove"], opts);

    const req: any = {
      path: "{dir}/view/{name}/removeJobFromView",
      query: { name: opts.job },
      type: "form",
      name: "view.remove",
      body: {},
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.job) throw new Error("job required");

      req.params = { dir: folder.dir(), name: folder.name() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(req, middleware.empty);
  }
}

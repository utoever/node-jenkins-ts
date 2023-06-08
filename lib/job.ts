import * as middleware from "./middleware";
import { JenkinsRequest, makeRequest } from "./request";
import * as utils from "./utils";

export class Job {

  constructor(private readonly jenkins: any) {
  }

  /**
   * Trigger job build
   */
  async build(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "build"], opts);
    // const req = { name: "job.build" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.build", "{folder}/build", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/build";
      // req.params = { folder: folder.path() };
      req.params({ folder: folder.path() });

      if (typeof opts.parameters === "object") {
        // req.path += "WithParameters";
        req.addPath("WithParameters");

        let form: any;
        const data: any = {};

        for (const [name, val] of Object.entries<any>(opts.parameters)) {
          if (utils.isFileLike(val)) {
            if (!form) {
              if (!this.jenkins._formData) {
                throw new Error("formData must be defined when client initialized to use file upload");
              }
              form = new this.jenkins._formData();
            }
            form.append(name, val, val.filename || name);
          } else {
            data[name] = val;
          }
        }

        if (form) {
          for (const [name, val] of Object.entries(data)) {
            form.append(name, val);
          }
          req.body = form;

          let headers: any = {};
          for (const [name, val] of Object.entries(form.getHeaders())) {
            headers[name] = val;
          }
          req.headers = headers;
        }

        if (!req.body) {
          req.type = "form";
          req.body = data;
        }
      }

      // if (opts.delay) req.query.delay = opts.delay;
      // if (opts.token) req.query.token = opts.token;
      req.setDelay(opts.delay);
      req.setToken(opts.token);
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.ignoreErrorForStatusCodes(302),
      middleware.queueLocation
    );
  }

  /**
   * Get or update config
   */
  async config(name: string, xml: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "xml");
    this.jenkins._log(["debug", "job", "config"], opts);
    // const req = { name: "job.config" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.config", "{folder}/config.xml", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/config.xml";
      // req.params = { folder: folder.path() };
      req.params({ folder: folder.path() });

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
      middleware.notFound("job " + opts.name),
      (ctx: any, next: any) => {
        if (ctx.err || opts.xml) return middleware.empty(ctx, next);

        next(false, ctx.res.body.toString("utf8"));
      }
    );
  }

  /**
   * Copy job
   */
  async copy(from: string, name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "from", "name");
    this.jenkins._log(["debug", "job", "copy"], opts);
    // const req = { name: "job.copy" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.copy", "{dir}/createItem", opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.from) throw new Error("from required");

      // req.path = "{dir}/createItem";
      req.headers = { "content-type": "text/xml; charset=utf-8" };
      req.params = { dir: folder.dir() };

      // FIXME
      // req.query.name = folder.name();
      // req.query.from = opts.from;
      // req.query.mode = "copy";
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
   * Create new job from xml
   */
  async create(name: string, xml: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "xml");
    this.jenkins._log(["debug", "job", "create"], opts);
    // const req = { name: "job.create" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.create", "{dir}/createItem", opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.xml) throw new Error("xml required");

      // req.path = "{dir}/createItem";
      req.headers = { "content-type": "text/xml; charset=utf-8" };
      req.params = { dir: folder.dir() };
      req.setName(folder.name());
      req.body = Buffer.from(opts.xml);
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(req, middleware.empty);
  }

  /**
   * Destroy job
   */
  async destroy(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "destroy"], opts);
    // const req = { name: "job.destroy" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.destroy", "{folder}/doDelete", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/doDelete";
      req.params = { folder: folder.path() };
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

  // async delete(...args: any[]): Promise<any> {
  //   // FIXME
  //   return await this.destroy(...args);
  // }

  /**
   * Disable job
   */
  async disable(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "disable"], opts);
    // const req = { name: "job.disable" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.disable", "{folder}/disable", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/disable";
      req.params = { folder: folder.path() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to disable: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Enable job
   */
  async enable(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "enable"], opts);
    // const req = { name: "job.enable" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.enable", "{folder}/enable", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/enable";
      req.params = { folder: folder.path() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name),
      middleware.require302("failed to enable: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Job exists
   */
  async exists(name: string, opts?: any): Promise<boolean> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "exists"], opts);
    // const req = { name: "job.exists" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.exists", "{folder}/api/json", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/api/json";
      req.params = { folder: folder.path() };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._head(req, middleware.exists);
  }

  /**
   * Job details
   */
  async get(name: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "get"], opts);
    // const req = { name: "job.get" };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.get", "{folder}/api/json", opts);

    try {
      const folder = utils.folderPath(opts.name);
      if (folder.isEmpty()) throw new Error("name required");

      // req.path = "{folder}/api/json";
      req.params = { folder: folder.path() };
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
   * List jobs
   */
  async list(name?: string, opts?: any): Promise<any> {
    opts = utils.parse([...arguments], "name");
    this.jenkins._log(["debug", "job", "list"], opts);

    // const req = {
    //   name: "job.list",
    //   path: "/api/json",
    // };
    // utils.options(req, opts);
    const req: JenkinsRequest = makeRequest("job.list", "{folder}/api/json", opts);

    if (opts.name) {
      try {
        const folder = utils.folderPath(opts.name);
        if (folder.isEmpty()) throw new Error("name required");

        // req.path = "{folder}/api/json";
        req.params = { folder: folder.path() };
      } catch (err) {
        throw this.jenkins._err(err, req);
      }
    }

    return await this.jenkins._get(
      req,
      middleware.notFound(opts.name),
      middleware.body
    );
  }

}

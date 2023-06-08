import { LogStream } from "./log_stream";
import * as middleware from "./middleware";
import * as utils from "./utils";

export class Build {

  constructor(private readonly jenkins: any) {
  }

  /**
   * Build details
   */
  async get(name: string, number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "number");

    this.jenkins._log(["debug", "build", "get"], opts);

    const req: { name: string; path?: string; params?: { folder: utils.RawParam, name?: string; number: number } } = {
      name: "build.get",
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.number) throw new Error("number required");

      req.path = "{folder}/{number}/api/json";
      req.params = {
        folder: folder.path(),
        number: opts.number,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._get(
      req,
      middleware.notFound(opts.name + " " + opts.number),
      middleware.body
    );
  }

  /**
   * Stop build
   */
  async stop(name: string, number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "number");

    this.jenkins._log(["debug", "build", "stop"], opts);

    const req: { name: string; path?: string; params?: { folder: utils.RawParam, name?: string; number: number } } = {
      name: "build.stop",
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.number) throw new Error("number required");

      req.path = "{folder}/{number}/stop";
      req.params = {
        folder: folder.path(),
        number: opts.number,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name + " " + opts.number),
      middleware.require302("failed to stop: " + opts.name),
      middleware.empty
    );
  }

  /**
   * Terminate build
   */
  async term(name: string, number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "number");

    this.jenkins._log(["debug", "build", "term"], opts);

    const req: { name: string; path?: string; params?: { folder: utils.RawParam, name?: string; number: number } } = {
      name: "build.term",
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.number) throw new Error("number required");

      req.path = "{folder}/{number}/term";
      req.params = {
        folder: folder.path(),
        number: opts.number,
      };
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name + " " + opts.number),
      middleware.empty
    );
  }

  /**
   * Get build log
   */
  async log(name: string, number: number, opts: any): Promise<any> {
    opts = utils.parse([...arguments], "name", "number");

    this.jenkins._log(["debug", "build", "log"], opts);

    const req: { name: string; path?: string; params?: { folder: utils.RawParam, name?: string; number: number }; type?: string; body?: any } = {
      name: "build.log",
    };

    utils.options(req, opts);

    try {
      const folder = utils.folderPath(opts.name);

      if (folder.isEmpty()) throw new Error("name required");
      if (!opts.number) throw new Error("number required");

      req.path = "{folder}/{number}/logText/progressive{type}";
      req.params = {
        folder: folder.path(),
        number: opts.number,
        type: opts.type === "html" ? "Html" : "Text",
      };
      req.type = "form";
      req.body = {};
      if (opts.hasOwnProperty("start")) req.body.start = opts.start;
    } catch (err) {
      throw this.jenkins._err(err, req);
    }

    return await this.jenkins._post(
      req,
      middleware.notFound(opts.name + " " + opts.number),
      (ctx, next) => {
        if (ctx.err) return next(ctx.err);
        if (!opts.meta) return next(false, ctx.res.body);

        const data: {text: string, more: boolean, size?: number} = {
          text: ctx.res.body,
          more: ctx.res.headers["x-more-data"] === "true",
        };

        if (ctx.res.headers["x-text-size"]) {
          data.size = ctx.res.headers["x-text-size"];
        }

        next(false, data);
      }
    );
  }

  /**
   * Get log stream
   */
  logStream(name: string, number: number, opts: any): LogStream {
    opts = utils.parse([...arguments], "name", "number");

    return new LogStream(this.jenkins, opts);
  }

}

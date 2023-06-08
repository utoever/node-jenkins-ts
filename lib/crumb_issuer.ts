import * as utils from "./utils";

export class CrumbIssuer {

  constructor(private readonly jenkins: any) {
  }

  /**
   * Get crumb
   */
  async get(opts: any): Promise<any> {
    opts = utils.parse([...arguments]);

    this.jenkins._log(["debug", "crumbIssuer", "get"], opts);

    const req = {
      name: "crumbIssuer.get",
      path: "/crumbIssuer/api/json",
    };

    utils.options(req, opts);

    return await this.jenkins._get(req, (ctx: any, next: any) => {
      if (ctx.err) return next(ctx.err);

      const data = ctx.res.body;

      if (data && data._class === "hudson.security.csrf.DefaultCrumbIssuer") {
        const cookies = ctx.res.headers["set-cookie"];

        if (cookies && cookies.length) {
          data.cookies = [];

          for (let i = 0; i < cookies.length; i++) {
            data.cookies.push(cookies[i].split(";")[0]);
          }
        }
      }

      next(false, data);
    });
  }

}

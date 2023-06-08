import { parse as urlParse } from 'url';
import { JenkinsRequest } from './request';

/**
 * Common options
 */

export function options(req: any, opts: any): any {
  if (!req.query) req.query = {};

  if (typeof opts.depth === "number") {
    req.query.depth = opts.depth;
  }

  if (typeof opts.tree === "string") {
    req.query.tree = opts.tree;
  }

  return opts;
}

/**
 * Raw path param
 */
export class RawParam {
  encode: boolean;
  value: any;

  constructor(value: any) {
    this.encode = false;
    this.value = value || "";
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Parse job name from URL
 */
export function parseName(value: string): string[] {
  const jobParts: string[] = [];

  const pathParts: string[] = (urlParse(value).pathname || "").split("/").filter(Boolean);
  let state: number = 0;
  let part: string;

  // iterate until we find our first job, then collect the continuous job parts
  //   ['foo', 'job', 'a', 'job', 'b', 'bar', 'job', 'c'] => ['a', 'b']
  loop: for (let i = 0; i < pathParts.length; i++) {
    part = pathParts[i];

    switch (state) {
      case 0:
        if (part === "job") state = 2;
        break;
      case 1:
        if (part !== "job") break loop;
        state = 2;
        break;
      case 2:
        jobParts.push(part);
        state = 1;
        break;
    }
  }

  return jobParts.map(decodeURIComponent);
}

/**
 * Path for folder plugin
 */
export class FolderPath {
  SEP: string = "/job/";
  val: string[];

  constructor(val: any) {
    if (Array.isArray(val)) {
      this.val = val;
    } else if (typeof val === "string") {
      if (val.match("^https?://")) {
        this.val = parseName(val);
      } else {
        this.val = val.split("/").filter(Boolean);
      }
    } else {
      this.val = [];
    }
  }

  isEmpty(): boolean {
    return !this.val.length;
  }

  name(): string {
    return this.val[this.val.length - 1] || "";
  }

  path(): RawParam {
    // FIXME
    // if (this.isEmpty()) return new RawParam();

    return new RawParam(
      this.SEP + this.val.map(encodeURIComponent).join(this.SEP)
    );
  }

  parent(): FolderPath {
    return new FolderPath(
      this.val.slice(0, Math.max(0, this.val.length - 1))
    );
  }

  dir(): RawParam {
    return this.parent().path();
  }
}


/**
 * Default crumb issuser
 */
export async function crumbIssuer(jenkins: any): Promise<any> {
  const data = await jenkins.crumbIssuer.get();

  if (!data || !data.crumbRequestField || !data.crumb) {
    throw new Error("Failed to get crumb");
  }

  return {
    headerName: data.crumbRequestField,
    headerValue: data.crumb,
    cookies: data.cookies,
  };
}

/**
 * Check if object is file like
 */
export function isFileLike(v: any): boolean {
  return (
    Buffer.isBuffer(v) ||
    (v !== null &&
      typeof v === "object" &&
      typeof v.pipe === "function" &&
      v.readable !== false)
  );
}

/**
 * Parse arguments
 */
export function parse(args: any[], ...names: string[]): any {
  let last = args.length - 1;

  let opts: any;
  if (typeof args[last] === "object") {
    if (args[last] === null) {
      opts = {};
    } else {
      opts = clone(args[last]);
    }
    last--;
  } else {
    opts = {};
  }

  for (let i = 0; i <= last; i++) {
    const name = names[i];
    const arg = args[i];

    if (name && arg !== null && arg !== undefined) {
      opts[name] = arg;
    }
  }

  return opts;
}


/**
 * Shallow clone
 */
export function clone(src: any) {
  return Object.assign({}, src);
}

export const folderPath = (value: any) => new FolderPath(value);

// exports.options = options;
// exports.folderPath = (value) => new FolderPath(value);
// exports.crumbIssuer = crumbIssuer;
// exports.isFileLike = isFileLike;
// exports.clone = clone;
// exports.parse = parse;

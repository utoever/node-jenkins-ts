import papi from "papi";
import { Build } from './build';
import { CrumbIssuer } from './crumb_issuer';
import { Job } from './job';
import { Label } from './label';
import { Node } from './node';
import { Plugin } from './plugin';
import { Queue } from './queue';
import * as utils from './utils';
import { View } from './view';

// import papi = require("papi");
export class Jenkins extends papi.Client {

  private _formData: any;
  private _build: Build;
  private _crumbIssuer: CrumbIssuer;
  private _job: Job;
  private _label: Label;
  private _node: Node;
  private _plugin: Plugin;
  private _queue: Queue;
  private _view: View;

  constructor(baseUrl: string, opts: any) {
    opts = utils.parse([...arguments], "baseUrl");

    if (!opts.headers) {
      opts.headers = {};
    } else {
      opts.headers = utils.clone(opts.headers);
    }
    if (!opts.headers.referer) {
      opts.headers.referer = opts.baseUrl + "/";
    }

    opts.name = "jenkins";

    const crumbIssuer = opts.crumbIssuer;
    const formData = opts.formData;

    delete opts.crumbIssuer;
    delete opts.formData;

    super(opts);

    if (typeof crumbIssuer === "function") {
      this._crumbIssuer = crumbIssuer;
    } else if (crumbIssuer === true || typeof crumbIssuer === "undefined") {
      this.initializeCrumbIssuer();;
    }

    if (formData) {
      if (typeof formData !== "function" || formData.name !== "FormData") {
        throw new Error("formData is invalid");
      }
      this._formData = formData;
    }

    this._build = new Build(this);
    this._crumbIssuer = new CrumbIssuer(this);
    this._job = new Job(this);
    this._label = new Label(this);
    this._node = new Node(this);
    this._plugin = new Plugin(this);
    this._queue = new Queue(this);
    this._view = new View(this);
  }

  private async initializeCrumbIssuer() {
    this._crumbIssuer = await utils.crumbIssuer(this);
  }

  get build(): Build {
    return this._build;
  }

  set build(value: Build) {
    this._build = value;
  }

  get crumbIssuer(): CrumbIssuer {
    return this._crumbIssuer;
  }

  set crumbIssuer(value: CrumbIssuer) {
    this._crumbIssuer = value;
  }

  get job(): Job {
    return this._job;
  }

  set job(value: Job) {
    this._job = value;
  }

  get label(): Label {
    return this._label;
  }

  set label(value: Label) {
    this._label = value;
  }

  get node(): Node {
    return this._node;
  }

  set node(value: Node) {
    this._node = value;
  }

  get plugin(): Plugin {
    return this._plugin;
  }

  set plugin(value: Plugin) {
    this._plugin = value;
  }

  get queue(): Queue {
    return this._queue;
  }

  set queue(value: Queue) {
    this._queue = value;
  }

  get view(): View {
    return this._view;
  }

  set view(value: View) {
    this._view = value;
  }

}

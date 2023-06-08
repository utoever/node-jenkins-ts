export class JenkinsRequest {

    private _method: string = 'GET';
    private _type: string | undefined;
    private _headers: any | undefined;
    private _body?: Buffer | undefined;

    private _params: any | undefined;

    private query: RequestQuery;

    constructor(private readonly name: string, private path: string, private opts: any | undefined) {
        if (opts) {
            this.query = {
                depth: typeof opts.depth === "number" ? opts.depth : 0,
                tree: typeof opts.tree === "string" ? opts.tree : ''
            };
        } else {
            this.query = {
                depth: 0,
                tree: ''
            }
        }
    }

    set method(method: string) {
        this._method = method;
    }

    get method() {
        return this._method;
    }

    set headers(headers: any | undefined) {
        if (headers) {
            this._headers = headers;
        } else {
            this._headers = {};
        }
    }

    get headers() {
        return this._headers;
    }

    set params(params: any | undefined) {
        if (params) {
            this._params = params;
        }
    }

    get params() {
        return this._params;
    }

    addPath(pathSuffix: string) {
        this.path += pathSuffix;
    }

    set body(body: any | undefined) {
        if (body) {
            this._body = body;
        }
    }

    get body() {
        return this._body;
    }

    set type(type: string | undefined) {
        if (type) {
            this._type = type;
        }
    }

    setName(name: string) {
        if (name) {
            this.query.name = name;
        }
    }

    setDelay(delay: string) {
        if (delay) {
            this.query.delay = delay;
        }
    }

    setToken(token: string) {
        if (token) {
            this.query.token = token;
        }
    }

    setStat(start: string) {
        if (start) {
            this.query.start = start;
        }
    }

}

export interface RequestQuery {

    depth: number
    tree: string
    delay?: string
    token?: string
    name?: string
    from?: string
    mode?: string
    start?: string

}

export function makeRequest(name: string, path: string, opts: any): JenkinsRequest {
    let depth: number;
    if (typeof opts.depth === "number") {
        depth = opts.depth;
    }

    let tree: string;
    if (typeof opts.tree === "string") {
        tree = opts.tree;
    }

    const req: JenkinsRequest = new JenkinsRequest(name, path, opts);
    // const req: JenkinsRequest = {
    //     name: name,
    //     path: path,
    //     method: 'GET',
    //     type: '',
    //     headers: {},
    //     query: {
    //         depth: 0,
    //         tree: "",
    //         delay: '',
    //         token: '',
    //         name: undefined,
    //         from: undefined,
    //         mode: undefined
    //     },
    //     params: {}
    // }

    return req;
}


export interface JenkinsRequest2 {

    name: string
    path: string
    type: string
    method?: string
    headers: any
    body?: Buffer

    query: {
        depth: number
        tree: string
        delay: string
        token: string
        name?: string
        from?: string
        mode?: string
    }

    params: any

}

export class JenkinsRequest {

    private path: string | undefined;
    private type: string | undefined;
    private method?: string = 'GET';
    private headers: any = {};
    private body?: Buffer;

    private query!: RequestQuery;

    private params: any = {};

    constructor(private readonly name: string) {
    }

}

export interface RequestQuery {

    depth: number
    tree: string
    delay: string
    token: string
    name?: string
    from?: string
    mode?: string

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

export function makeRequest(name: string, opts: any, path?: string | undefined): JenkinsRequest {
    let depth: number;
    if (typeof opts.depth === "number") {
        depth = opts.depth;
    }

    let tree: string;
    if (typeof opts.tree === "string") {
        tree = opts.tree;
    }

    const req: JenkinsRequest = {
        name: name,
        path: path ?? '',
        type: '',
        headers: {},
        query: {
            depth: 0,
            tree: "",
            delay: '',
            token: '',
            name: undefined,
            from: undefined,
            mode: undefined
        },
        params: {}
    }

    return req;
}

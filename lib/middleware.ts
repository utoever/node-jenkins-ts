/**
 * Body
 */
function body(ctx: any, next: any) {
  if (ctx.err) return next(ctx.err);

  next(false, ctx.res.body);
}

/**
 * Body item
 */
function bodyItem(key: string) {
  return (ctx: any, next: any) => {
    if (ctx.err) return next(ctx.err);

    next(false, ctx.res.body[key]);
  };
}

/**
 * Empty
 */
function empty(ctx: any, next: any) {
  if (ctx.err) return next(ctx.err);

  next(false);
}

/**
 * Exists
 */
function exists(ctx: any, next: any) {
  if (ctx.res && ctx.res.statusCode === 404) {
    return next(false, false);
  }

  if (ctx.err) return next(ctx.err);
  next(false, true);
}

/**
 * Ignore errors for provided status codes
 */
function ignoreErrorForStatusCodes(...statusCodes: number[]) {
  return (ctx: any, next: any) => {
    if (ctx.err && ctx.res && statusCodes.indexOf(ctx.res.statusCode) !== -1) {
      delete ctx.err;
    }

    next();
  };
}

/**
 * Require 302 or error
 */
function require302(message: string) {
  return (ctx: any, next: any) => {
    if (ctx.res && ctx.res.statusCode === 302) {
      return next(false);
    } else if (ctx.res) {
      if (ctx.err) {
        if (!ctx.res.headers["x-error"]) ctx.err.message = message;
      } else {
        ctx.err = new Error(message);
      }

      return next(ctx.err);
    }

    next();
  };
}

/**
 * Not found
 */
function notFound(value: string) {
  return (ctx: any, next: any) => {
    if (ctx.res && ctx.res.statusCode === 404) {
      const err = new Error(value + " not found");
      // FIXME
      // err.notFound = true;

      return next(err);
    }

    next();
  };
}

/**
 * Queue location
 */
function queueLocation(ctx: any, next: any) {
  if (ctx.err) return next(ctx.err);

  try {
    // Get queue number from location header
    const parts = ctx.res.headers.location.split("/");

    return next(false, parseInt(parts[parts.length - 2], 10));
  } catch (err) {
    // ignore errors
  }

  next();
}

export {
  body,
  bodyItem,
  empty,
  exists,
  ignoreErrorForStatusCodes,
  require302,
  notFound,
  queueLocation,
};

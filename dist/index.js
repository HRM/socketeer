"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  startServer: () => startServer
});
module.exports = __toCommonJS(src_exports);
var import_http = require("http");
var import_socket = require("socket.io");
var import_koa = __toESM(require("koa"));
var import_zod = __toESM(require("zod"));
var import_node_fetch = __toESM(require("node-fetch"));
var import_router = __toESM(require("@koa/router"));
var import_koa_bodyparser = __toESM(require("koa-bodyparser"));
var authSchema = import_zod.default.object({
  data: import_zod.default.string(),
  contentType: import_zod.default.string().optional()
});
var authResponse = import_zod.default.object({
  user: import_zod.default.string()
});
function startServer(config) {
  const koa = new import_koa.default();
  const server = (0, import_http.createServer)();
  const io = new import_socket.Server(server, { path: config.socketPath });
  io.on("connect", (socket) => {
    socket.on("auth", async (data) => {
      const parsed = authSchema.safeParse(data);
      if (parsed.success) {
        try {
          const res = await (0, import_node_fetch.default)(config.authUrl, {
            method: "POST",
            body: parsed.data.data,
            headers: {
              "Content-Type": parsed.data.contentType ?? "text/html"
            }
          });
          const parsedRes = authResponse.safeParse(await res.json());
          if (parsedRes.success) {
            socket.join("user_" + parsedRes.data.user);
          }
        } catch (e) {
        }
      }
    });
  });
  const router = new import_router.default();
  router.post("/send/:event/:user", (ctx) => {
    io.in("user_" + ctx.params.user).emit(ctx.params.event, ctx.body);
  });
  router.post("/send/:event", (ctx) => {
    io.emit(ctx.params.event, ctx.body);
  });
  server.listen(config.socketPort);
  koa.use((0, import_koa_bodyparser.default)());
  koa.use(router.routes());
  koa.use(router.allowedMethods());
  koa.listen(config.backendPort);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startServer
});
//# sourceMappingURL=index.js.map
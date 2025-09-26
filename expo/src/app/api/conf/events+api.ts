import * as jsonServer from "json-server";
import combined from "@/api_data/combined.json" with { type: "json" };
import * as querystring from "node:querystring";

const router = jsonServer.router(combined);

export async function GET(req: Request) {
  const { resolve, promise } = Promise.withResolvers();

  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/api\/conf/, "");
  router(
    {
      method: "GET",
      url: url.toString(),
      path: url.pathname,
      headers: {},
      query: querystring.parse(url.search.replace(/^\?/, "")),
      params: {},
    } as any,
    {
      statusCode: 200,
      locals: {},
      status(code: any) {
        this.statusCode = code;
        return this;
      },
      jsonp(data: any) {
        resolve(Response.json(data, { status: this.statusCode }));
        return this;
      },
    } as any,
    () => {
      throw new Error(`Could not handle ${req.url}`);
    }
  );
  return promise;
}

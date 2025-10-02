import { parseCookies } from "@/agent/utils/oauth/parseCookies";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import middleware from "./middleware";
import * as callback from "./callback";
import * as login from "./login";
import * as refresh from "./refresh";
import * as status from "./status";

export interface OauthConfig {
  cookiePrefix: string;
  clientConfigFile: string;
  protectedResourceUrl: string;
}

export interface ClientConfig {
  clientId: string;
  tokenEndpoint: string;
  issuer: string;
  accessTokenMaxAge?: number;
  refreshTokenMaxAge?: number;
}

export interface OauthContext extends OauthConfig {
  cookiePrefix: string;
  accessTokenName: string;
  refreshTokenName: string;
  accessTokenMaxAge: number;
  refreshTokenMaxAge: number;
  accessToken: (request: Request) => string | null;
  refreshToken: (request: Request) => string | null;
  readClientConfigFile: () => Promise<ClientConfig | null>;
  writeClientConfigFile: (config: ClientConfig) => Promise<void>;
}

export function createOauth(config: OauthConfig) {
  const accessTokenName = `${config.cookiePrefix}_access_token`;
  const refreshTokenName = `${config.cookiePrefix}_refresh_token`;
  const clientConfigFile = join(process.cwd(), config.clientConfigFile);
  const context: OauthContext = {
    ...config,
    accessTokenName,
    refreshTokenName,
    accessTokenMaxAge: 60 * 60 * 24, // 1 day default
    refreshTokenMaxAge: 60 * 60 * 24 * 30, // 30 days default
    accessToken: (request: Request) => {
      const cookies = parseCookies(request.headers.get("Cookie"));
      return cookies[accessTokenName] || null;
    },
    refreshToken: (request: Request) => {
      const cookies = parseCookies(request.headers.get("Cookie"));
      return cookies[refreshTokenName] || null;
    },
    readClientConfigFile: async () => {
      try {
        const configJson = await readFile(clientConfigFile, "utf-8");
        return JSON.parse(configJson) as ClientConfig;
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
    writeClientConfigFile: async (config: ClientConfig) => {
      const configJson = JSON.stringify(config, null, 2);
      return writeFile(clientConfigFile, configJson, "utf-8");
    },
  };

  return {
    accessToken: context.accessToken,
    middleware: (request: Request) => middleware(request, context),
    callback: { GET: (request: Request) => callback.GET(request, context) },
    login: { GET: (request: Request) => login.GET(request, context) },
    refresh: { POST: (request: Request) => refresh.POST(request, context) },
    status: {
      GET: (request: Request) => status.GET(request, context),
      DELETE: (request: Request) => status.DELETE(request, context),
    },
  };
}

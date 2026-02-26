import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  APP_BASE_URL: z.url(),
  WASTE_API_BASE_URL: z.url().optional(),
  WASTE_API_KEY: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

export const serverEnv = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: "development" as const,
      APP_BASE_URL: "http://localhost:3000",
      WASTE_API_BASE_URL: undefined,
      WASTE_API_KEY: undefined,
    };

export function hasWasteApiConfig(): boolean {
  return Boolean(serverEnv.WASTE_API_BASE_URL && serverEnv.WASTE_API_KEY);
}

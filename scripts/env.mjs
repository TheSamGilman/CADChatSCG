import { copyFileSync, existsSync } from "node:fs";

for (const dir of ["packages/database", "apps/api", "apps/web"]) {
  const env = `${dir}/.env`;
  if (existsSync(env)) {
    console.log(`${env} exists, left unchanged`);
  } else {
    copyFileSync(`${dir}/.env.example`, env);
    console.log(`created ${env} from .env.example`);
  }
}

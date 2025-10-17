import { eq } from "drizzle-orm";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import db from "./client";
import { user } from "./schema/auth";

async function seed() {
  console.log("->> start");
  const data = await auth.api.createUser({
    body: {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      name: "ADMIN",
      role: "admin",
    },
  });
  await db
    .update(user)
    .set({ emailVerified: true })
    .where(eq(user.email, data.user.email));
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("->> Done");
  });

import db from "./client";
import { member } from "./schema/auth";

async function seed() {
  console.log("->> start");
  const memberCount = await db.$count(member);
  console.log(memberCount);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("->> Done");
    process.exit(1);
  });

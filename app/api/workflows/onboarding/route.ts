import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import { serve } from "@upstash/workflow/nextjs";

import { sentEmail } from "@/lib/workflow";

type UserState = "non-active" | "active";

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
const THREE_DAYS_IN_MS = 60 * 60 * 24 * 3 * 1000;
const ONE_MONTH_IN_MS = 60 * 60 * 24 * 30 * 1000;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if(user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());

  if(diffTime > THREE_DAYS_IN_MS && diffTime <= ONE_MONTH_IN_MS) return "non-active";
  
  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Welcome email
  await context.run("new-signup", async () => {
    await sentEmail(email, "Welcome to BookShelf", `<p>Welcome ${fullName} to BookShelf</p>`);
  });

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sentEmail(email, "Are you still with us?", `<p>Hey ${fullName}, we noticed you haven't used BookShelf in a while. We're here if you need help or just want to chat!</p>`);
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sentEmail(email, "Welcome back!", `<p>Hey ${fullName}, we're thrilled to have you back! We've got some exciting updates and features we think you'll love. Let's dive in and make your experience even better!</p>`);
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});


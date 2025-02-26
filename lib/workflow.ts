import { Client as WorkflowClient } from "@upstash/workflow";
import config from "./config";
import { Client as QStashClient, resend } from "@upstash/qstash";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qStashUrl,
  token: config.env.upstash.qStashToken,
});

const qStashClient = new QStashClient({ token: config.env.upstash.qStashToken });

export const sentEmail = async (email: string, subject: string, html: string) => {
  await qStashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.env.resendToken }),
    },
    body: {
      from: "BookShelf <contact@mrpranavr.in>",
      to: [email],
      subject: subject,
      html: html,
    },
  });
}

"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const COOKIE_NAME = "conversations";
const UUID_LENGTH = 36;

export async function getConversationId(): Promise<string | null> {
  let conversationId = cookies().get(COOKIE_NAME)?.value ?? "";

  if (conversationId.length === UUID_LENGTH) {
    return conversationId;
  }

  return null;
}

export async function createConversation(): Promise<string> {
  const conversationId = randomUUID();
  cookies().set(COOKIE_NAME, conversationId, {});
  return conversationId;
}

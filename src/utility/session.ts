"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const SESSION_COOKIE_NAME = "session";
const UUID_LENGTH = 36;

export async function getSessionId(): Promise<string | null> {
  let sessionId = cookies().get(SESSION_COOKIE_NAME)?.value ?? "";

  if (sessionId.length === UUID_LENGTH) {
    return sessionId;
  }

  return null;
}

export async function createSession(): Promise<string> {
  const sessionId = randomUUID();
  cookies().set(SESSION_COOKIE_NAME, sessionId, {});
  return sessionId;
}

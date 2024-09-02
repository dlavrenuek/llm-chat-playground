"use client";

const defaultHeaders = { "Content-Type": "application/json" };

export async function postMessage(message: string) {
  return fetch("/api", {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: defaultHeaders,
  });
}

import { createHash, timingSafeEqual } from "node:crypto";

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeCompare(value: string, expected: string | undefined) {
  if (!expected) {
    return false;
  }

  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function isValidFormToken(token: string) {
  return safeCompare(token, process.env.FORM_ACCESS_TOKEN);
}

export function isValidAdminPassword(password: string) {
  return safeCompare(password, process.env.ADMIN_REPORT_PASSWORD);
}

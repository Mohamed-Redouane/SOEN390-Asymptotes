import { describe, it, expect } from "vitest";
import { getVerificationEmailHtml, getPasswordResetEmailHtml } from "../../services/emailTemplate.js";

describe("Email Template Functions", () => {
  describe("getVerificationEmailHtml", () => {
    it("should include the correct title", () => {
      const html = getVerificationEmailHtml("123456", "Alice");
      expect(html).toContain("<title>Email Verification - ONCampus</title>");
    });

    it("should include the provided username and code", () => {
      const code = "123456";
      const username = "Alice";
      const html = getVerificationEmailHtml(code, username);
      expect(html).toContain(`Hi ${username},`);
      expect(html).toContain(`<div class="code">${code}</div>`);
    });

    it("should default username to 'User' if falsy", () => {
      const code = "123456";
      const html = getVerificationEmailHtml(code, "");
      expect(html).toContain("Hi User,");
    });

    it("should include the current year in the footer", () => {
      const html = getVerificationEmailHtml("123456", "Alice");
      const currentYear = new Date().getFullYear().toString();
      expect(html).toContain(`&copy; ${currentYear} ONCampus`);
    });
  });

  describe("getPasswordResetEmailHtml", () => {
    it("should include the correct title", () => {
      const html = getPasswordResetEmailHtml("654321", "Bob");
      expect(html).toContain("<title>Password Reset - ONCampus</title>");
    });

    it("should include the provided username and code", () => {
      const code = "654321";
      const username = "Bob";
      const html = getPasswordResetEmailHtml(code, username);
      expect(html).toContain(`Hi ${username},`);
      expect(html).toContain(`<div class="code">${code}</div>`);
    });

    it("should default username to 'User' if falsy", () => {
      const code = "654321";
      const html = getPasswordResetEmailHtml(code, "");
      expect(html).toContain("Hi User,");
    });

    it("should include the current year in the footer", () => {
      const html = getPasswordResetEmailHtml("654321", "Bob");
      const currentYear = new Date().getFullYear().toString();
      expect(html).toContain(`&copy; ${currentYear} ONCampus`);
    });
  });
});

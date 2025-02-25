import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Email Service", () => {
  let sendVerificationEmail: (email: string, code: string, username: string) => Promise<void>;
  let sendPasswordResetEmail: (email: string, code: string, username: string) => Promise<void>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(async () => {

    vi.resetModules();


    mockSend = vi.fn();

    vi.doMock("resend", () => ({
      Resend: vi.fn().mockImplementation(() => ({
        emails: {
          send: mockSend,
        },
      })),
    }));

    vi.doMock("../../services/emailTemplate.js", () => ({
      getVerificationEmailHtml: vi.fn().mockReturnValue("<p>Verification Email</p>"),
      getPasswordResetEmailHtml: vi.fn().mockReturnValue("<p>Password Reset Email</p>"),
    }));

    // Dynamically import the email service after mocks are set up
    const emailService = await import("../../services/emailService.js");
    sendVerificationEmail = emailService.sendVerificationEmail;
    sendPasswordResetEmail = emailService.sendPasswordResetEmail;
  });

  it("should send a verification email", async () => {

    mockSend.mockResolvedValueOnce({ success: true });


    await sendVerificationEmail("test@example.com", "123456", "TestUser");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      from: "no-reply@cu-oncampus.ca",
      to: "test@example.com",
      subject: "Verify Your Email - ONCampus",
      html: "<p>Verification Email</p>",
    });
  });

  it("should throw an error if verification email sending fails", async () => {

    mockSend.mockRejectedValueOnce(new Error("API Error"));


    await expect(sendVerificationEmail("test@example.com", "123456", "TestUser"))
      .rejects.toThrow("Failed to send verification email.");
  });

  it("should send a password reset email", async () => {
    // Arrange
    mockSend.mockResolvedValueOnce({ success: true });

    // Act
    await sendPasswordResetEmail("test@example.com", "654321", "TestUser");

    // Assert
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      from: "no-reply@cu-oncampus.ca",
      to: "test@example.com",
      subject: "Reset Your Password - ONCampus",
      html: "<p>Password Reset Email</p>",
    });
  });

  it("should throw an error if password reset email sending fails", async () => {
    // Arrange
    mockSend.mockRejectedValueOnce(new Error("API Error"));

    // Act & Assert
    await expect(sendPasswordResetEmail("test@example.com", "654321", "TestUser"))
      .rejects.toThrow("Failed to send password reset email.");
  });
});

import { describe, it, expect, vi } from "vitest";
import axios, { AxiosError } from "axios";
import { isAxiosError } from "../../utils/axiosUtils";

describe("isAxiosError", () => {
  it("should return true for an instance of AxiosError", () => {
    const axiosError = new AxiosError("Test error message");
    expect(isAxiosError(axiosError)).toBe(true);
  });

  it("should return false for a generic Error", () => {
    const genericError = new Error("Generic error");
    expect(isAxiosError(genericError)).toBe(false);
  });

  it("should return false for a plain object", () => {
    expect(isAxiosError({ message: "Not an error" })).toBe(false);
  });

  it("should return false for a non-object value", () => {
    expect(isAxiosError("some error string")).toBe(false);
  });

  it("should call axios.isAxiosError internally", () => {
    const spy = vi.spyOn(axios, "isAxiosError");
    const errorInstance = new Error("Generic error");
    isAxiosError(errorInstance);
    expect(spy).toHaveBeenCalledWith(errorInstance);
    spy.mockRestore();
  });
});

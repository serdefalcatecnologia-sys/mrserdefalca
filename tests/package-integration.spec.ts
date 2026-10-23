// Regression tests for dependency upgrades in the application package.
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

describe("package integrations", () => {
  it("creates a Supabase client with authentication and query APIs", () => {
    const client = createClient(
      "https://example.supabase.co",
      "test-anon-key",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    expect(typeof client.auth.signInWithPassword).toBe("function");
    expect(typeof client.from("records").select).toBe("function");
  });

  it("generates a PDF table", () => {
    const document = new jsPDF();
    autoTable(document, {
      head: [["Column"]],
      body: [["Value"]],
    });

    expect(document.getNumberOfPages()).toBe(1);
    expect(document.lastAutoTable?.finalY).toBeGreaterThan(0);
  });
});

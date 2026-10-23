// Regression tests for dependency upgrades in the application package.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

    assert.equal(typeof client.auth.signInWithPassword, "function");
    assert.equal(typeof client.from("records").select, "function");
  });

  it("generates a PDF table", () => {
    const document = new jsPDF();
    autoTable(document, {
      head: [["Column"]],
      body: [["Value"]],
    });

    assert.equal(document.getNumberOfPages(), 1);
    assert.ok(document.output("arraybuffer").byteLength > 0);
  });
});

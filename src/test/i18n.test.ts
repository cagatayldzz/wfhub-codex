import * as fs from "fs";
import * as path from "path";

import * as os from "os";
import { afterAll, describe, expect, it, vi } from "vitest";

import { loadI18nData } from "../utils/i18n";

describe("loadI18nData", () => {
  const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

  afterAll(() => {
    spy.mockRestore();
  });

  it("reads and parses the provided json file", async () => {
    const dir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "wfhub-codex-")
    );
    const file = path.join(dir, "i18n.json");
    const payload = {
      sample: {
        en: {
          description: "Sample description",
          name: "Sample name",
        },
      },
    };

    try {
      await fs.promises.writeFile(file, JSON.stringify(payload), "utf-8");

      await expect(loadI18nData(file)).resolves.toEqual(payload);
      expect(spy).toHaveBeenCalledWith("Loading i18n data...");
      expect(spy).toHaveBeenCalledWith("i18n data loaded.");
    } finally {
      await fs.promises.rm(dir, { recursive: true, force: true });
    }
  });

  it("rejects when the file does not exist", async () => {
    await expect(
      loadI18nData("/tmp/wfhub-missing-i18n.json")
    ).rejects.toThrow();
  });

  it("rejects malformed JSON", async () => {
    const dir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "wfhub-codex-")
    );
    const file = path.join(dir, "invalid.json");

    try {
      await fs.promises.writeFile(file, "{invalid", "utf-8");
      await expect(loadI18nData(file)).rejects.toThrow(SyntaxError);
    } finally {
      await fs.promises.rm(dir, { recursive: true, force: true });
    }
  });
});

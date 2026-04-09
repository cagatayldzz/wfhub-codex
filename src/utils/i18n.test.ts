import * as fs from "fs";
import * as path from "path";

import * as os from "os";
import { afterAll, describe, expect, it, vi } from "vitest";

import { loadI18nData } from "./i18n";

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

    await fs.promises.writeFile(file, JSON.stringify(payload), "utf-8");

    await expect(loadI18nData(file)).resolves.toEqual(payload);
    expect(spy).toHaveBeenCalledWith("Loading i18n data...");
    expect(spy).toHaveBeenCalledWith("i18n data loaded.");
  });
});

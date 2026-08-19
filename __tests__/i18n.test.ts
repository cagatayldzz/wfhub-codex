import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { loadI18nData } from "../src/utils/i18n";

describe("loadI18nData", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    logSpy.mockClear();
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) =>
          fs.promises.rm(directory, { recursive: true, force: true })
        )
    );
  });

  async function createFixture(contents: string): Promise<string> {
    const directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "wfhub-i18n-test-")
    );
    temporaryDirectories.push(directory);
    const file = path.join(directory, "i18n.json");
    await fs.promises.writeFile(file, contents, "utf8");
    return file;
  }

  it("reads and parses valid JSON without changing its shape", async () => {
    const payload = {
      ash: {
        en: { name: "Ash", description: "A stealthy assassin." },
        tr: { name: "Ash", description: "Gizli bir suikastçı." },
      },
    };

    await expect(
      loadI18nData(await createFixture(JSON.stringify(payload)))
    ).resolves.toEqual(payload);
    expect(logSpy).toHaveBeenNthCalledWith(1, "Loading i18n data...");
    expect(logSpy).toHaveBeenNthCalledWith(2, "i18n data loaded.");
  });

  it("rejects missing files", async () => {
    await expect(
      loadI18nData(path.join(os.tmpdir(), "wfhub-no-such-i18n-file.json"))
    ).rejects.toThrow(/ENOENT/);
  });

  it("rejects malformed JSON", async () => {
    await expect(
      loadI18nData(await createFixture("{invalid"))
    ).rejects.toBeInstanceOf(SyntaxError);
  });
});

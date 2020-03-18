/* eslint-disable @typescript-eslint/no-explicit-any */
import loadModule from "../src/utils/load-module";
import { normalizePath } from "../src/utils/path-utils";
import { getInlineMap, getExtractedMap, stripMap, MapModifier } from "../src/utils/sourcemap-utils";
import path from "path";

test("wrong util path", () => {
  const wrong = loadModule("totallyWRONGPATH/here" as any);
  expect(wrong).toBeUndefined();
});

test("inline map", () => {
  let code = ".foo {color: red;}";
  const wrongMap = getInlineMap(code);
  expect(wrongMap).toBeUndefined();
  code +=
    "/*# sourceMappingURL=data:application/json;base64,e1RISVM6SVNBU09VUkNFTUFQU0lNVUxBVElPTn0= */";
  const correctMap = getInlineMap(code);
  expect(correctMap).toBe("{THIS:ISASOURCEMAPSIMULATION}");
});

test("file map", async () => {
  const code = ".foo {color: red;}/*# sourceMappingURL=fixture.css.map */";
  const wrongMap = await getExtractedMap(code, path.resolve("this/is/nonexistant/path.css"));
  expect(wrongMap).toBeUndefined();
  const correctMap = await getExtractedMap(code, path.resolve("test/fixtures/utils/pointless.css"));
  expect(correctMap).toBe("{THIS:ISASOURCEMAPSIMULATION}");
});

test("strip map", () => {
  const code = ".foo {color: red;}/*# sourceMappingURL=fixture.css.map */";
  expect(stripMap(code)).toBe(".foo {color: red;}");
});

test("map modifier", () => {
  const map = JSON.stringify({
    sources: [
      normalizePath(path.join(process.cwd(), "..", "foo")),
      normalizePath(path.join(process.cwd(), "..", "bar")),
    ],
  });
  const relativeSrc = JSON.stringify(new MapModifier(map).relative().toObject().sources);
  expect(relativeSrc).toBe(JSON.stringify(["../foo", "../bar"]));
});

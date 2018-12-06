import {
  sign,
  mark,
  withSign,
  orNA,
  alignLeft,
  alignCenter,
  padder,
  border,
  isRow,
  row,
  diagnostic,
  generateTable
} from "../../src/utils/table";
import { DiffItem } from "../../src/CoverageReport";

describe("utils", () => {
  describe("table", () => {
    describe("sign", () => {
      it("returns empty string when the argument less than 0", () => {
        expect(sign(-2)).toBe("");
      });
      it("returns `+` when the argument larger than 0", () => {
        expect(sign(2)).toBe("+");
      });
      it("returns `+-` when the argument equal to 0", () => {
        expect(sign(0)).toBe("+-");
      });
    });
    describe("mark", () => {
      it("returns one space when the argument is null", () => {
        expect(mark(null)).toBe(" ");
      });
      it("returns one space when the argument equal to 0", () => {
        expect(mark(0)).toBe(" ");
      });
      it("returns `-` when the argument less than 0", () => {
        expect(mark(-2)).toBe("-");
      });
      it("returns `+` when the argument larger than 0", () => {
        expect(mark(2)).toBe("+");
      });
    });
    describe("withSign", () => {
      it("returns null when the argument is null", () => {
        expect(withSign(null)).toBe(null);
      });
      it("returns `+-0` when the argument equal to 0", () => {
        expect(withSign(0)).toBe("+-0");
      });
      it("returns -{number} when the argument less than 0", () => {
        expect(withSign(-123)).toBe("-123");
      });
      it("returns +{number} when the argument larger than 0", () => {
        expect(withSign(321)).toBe("+321");
      });
    });
    describe("orNA", () => {
      it("returns stringified number when the argument is number", () => {
        expect(orNA(0)).toBe("0");
        expect(orNA(1)).toBe("1");
      });
      it("returns as is when the argument is string", () => {
        expect(orNA("0")).toBe("0");
        expect(orNA("1")).toBe("1");
      });
      it("returns `-` when the argument is null", () => {
        expect(orNA(null)).toBe("-");
      });
    });
    describe("alignLeft", () => {
      it("returns string of length whose has been reduced by text length", () => {
        const text = "hoge";
        expect(alignLeft(text, 10, " ")).toBe(
          "hoge" + " ".repeat(10 - text.length)
        );
      });
      it("returns as is the text argument when length equal to 0", () => {
        expect(alignLeft("foo", 0, " ")).toBe("foo");
      });
    });
    describe("alignCenter", () => {
      it("returns text between two repeated chars", () => {
        expect(alignCenter("hoge", 10, "-")).toBe("---hoge---");
      });
      it("returns text correctly when the remainder of `(width - text.length) / 2` is odd number", () => {
        expect(alignCenter("hoge", 9, "-")).toBe("--hoge---");
      });
      it("returns as is the text argument when length equal to 0", () => {
        expect(alignCenter("foo", 0, " ")).toBe("foo");
      });
    });
    describe("padder", () => {
      it("returns left aligned string when the layouter is omitted", () => {
        expect(padder("foo")(5)).toBe("foo  ");
      });
      it("returns centered string when the layouter is alignCenter", () => {
        expect(padder("foo", alignCenter)(5)).toBe(" foo ");
      });
    });
    describe("border", () => {
      it("returns title between one of space", () => {
        expect(border("foo")(10)).toBe("== foo ===");
      });
    });
    describe("isRow", () => {
      it("returns true when the argument is return value of row", () => {
        const item = row([border("foo")]);
        expect(isRow(item)).toBe(true);
      });
      it("returns false when the argument is not row", () => {
        const item = { type: "hoge" };
        // @ts-ignore
        expect(isRow(item)).toBe(false);
      });
    });
    describe("diagnostic", () => {
      it("returns empty value when the argument is empty", () => {
        expect(diagnostic([])).toStrictEqual({ maxWidths: [], width: -1 });
      });
      it("calculates maxWidths and width correctly", () => {
        const rows = [row([padder("123"), padder("hoge foo bar")])];
        expect(diagnostic(rows)).toStrictEqual({
          maxWidths: [3, 12],
          width: 16
        });
      });
      it("calculates maxWidths and width correctly when multiple rows", () => {
        const rows = [
          row([padder("hoge foo"), padder("bar")]),
          row([padder("hoge"), padder("foo bar")])
        ];
        expect(diagnostic(rows)).toStrictEqual({
          maxWidths: [8, 7],
          width: 16
        });
      });
    });
    describe("generateTable", () => {
      const gen = (
        old: number | null,
        now: number,
        diff: number
      ): DiffItem => ({
        old,
        now,
        diff
      });
      const diff = {
        stats: {
          files: gen(120, 60, -60),
          lines: gen(100, 3456, 3356)
        },
        total: gen(null, 5.4, 5.4),
        lines: gen(10, 20.2, 10.2),
        statements: gen(20, 9.8, -9.8),
        functions: gen(null, 99.5, 99.5),
        branches: gen(null, 0, 0)
      };

      const table = [
        "```diff",
        "@@      Coverage Diff       @@",
        "             master #59  +/-  ",
        "========== Summary ===========",
        "+ Coverage   -      5%   +5%  ",
        "======== Diagnostics =========",
        "  Files      120    60   -60  ",
        "  Lines      100    3456 +3356",
        "========= Coverages ==========",
        "+ Lines      10%    20%  +10% ",
        "- Statements 20%    10%  -10% ",
        "+ Functions  -      100% +100%",
        "  Branches   -      0%   +-0% ",
        "```"
      ].join("\n");
      expect(generateTable(diff, { prId: "59", branch: "master" })).toBe(table);
    });
  });
});

import { EOL } from "os";
import { Diff } from "../CoverageReport";

export const sign = (num: number): string => {
  const s = Math.sign(num);
  return isNaN(s) ? " " : ["", "+-", "+"][s + 1];
};

export const mark = (num: number | null): string => {
  if (num == null) {
    return " ";
  }
  return num > 0 ? "+" : num < 0 ? "-" : " ";
};

export const withSign = (num: number | null): string | null =>
  num != null ? sign(num) + num : null;

export const orNA = (num: number | string | null): string =>
  num != null ? `${num}` : "-";

export const alignLeft = (
  text: string,
  width: number,
  char: string
): string => {
  return text + char.repeat(Math.max(width - text.length, 0));
};
export const alignCenter = (
  text: string,
  width: number,
  char: string
): string => {
  const leftLen = Math.floor((width - text.length) / 2);
  const rightLen = Math.ceil((width - text.length) / 2);
  return `${char.repeat(Math.max(leftLen, 0))}${text}${char.repeat(
    Math.max(rightLen, 0)
  )}`;
};
export const padder = (text: string, layouter = alignLeft) => (width: number) =>
  layouter(text, width, " ");

export const border = (title: string, char = "=") => (width: number) => {
  return alignCenter(` ${title} `, width, char);
};

type Renderer = (w: number) => string;

type Raw = {
  type: "raw";
  value: Renderer;
};
export const raw = (renderer: Renderer): Raw => ({
  type: "raw",
  value: renderer
});

type Row = {
  type: "row";
  values: Renderer[];
};
export const isRow = (el: RowTypes): el is Row => el.type === "row";
export const row = (values: Renderer[]): Row => ({
  type: "row",
  values
});

type RowTypes = Row | Raw;

export const diagnostic = (
  rows: RowTypes[]
): { maxWidths: number[]; width: number } => {
  const cellContainers = rows.filter(isRow);
  if (cellContainers.length === 0) {
    return {
      maxWidths: [],
      width: -1
    };
  }

  const maxWidths: number[] = cellContainers.reduce(
    (maxWidths, row) => {
      return row.values.map((value, i) => {
        return Math.max(value(0).length, maxWidths[i] || 0);
      });
    },
    [] as number[]
  );
  const width = maxWidths.reduce((sum, n) => sum + n) + maxWidths.length - 1;
  return { maxWidths, width };
};

export const generateTable = (
  diff: Diff,
  { prId, branch }: { prId: string; branch: string }
): string => {
  const {
    stats,
    total: t,
    lines: cL,
    statements: cS,
    functions: cF,
    branches: cB
  } = diff;
  const { lines: statL, files: statF } = stats;
  const rows: RowTypes[] = [
    row([
      padder(" "),
      padder(" "),
      padder(branch),
      padder(`#${prId}`),
      padder("+/-")
    ]),
    raw(border("Summary")),
    row([
      padder(mark(t.diff)),
      padder("Coverage"),
      padder(t.old != null ? `${Math.round(t.old)}%` : "-"),
      padder(`${Math.round(t.now)}%`),
      padder(
        withSign(t.diff) != null ? `${withSign(Math.round(t.diff))}%` : "-"
      )
    ]),
    raw(border("Diagnostics")),
    row([
      padder(" "),
      padder("Files"),
      padder(orNA(statF.old)),
      padder(String(statF.now)),
      padder(orNA(withSign(statF.diff)))
    ]),
    row([
      padder(" "),
      padder("Lines"),
      padder(orNA(statL.old)),
      padder(String(statL.now)),
      padder(orNA(withSign(statL.diff)))
    ]),
    raw(border("Coverages")),
    row([
      padder(mark(cL.diff)),
      padder("Lines"),
      padder(cL.old != null ? `${Math.round(cL.old)}%` : "-"),
      padder(`${Math.round(cL.now)}%`),
      padder(
        withSign(cL.diff) != null ? `${withSign(Math.round(cL.diff))}%` : "-"
      )
    ]),
    row([
      padder(mark(cS.diff)),
      padder("Statements"),
      padder(cS.old != null ? `${Math.round(cS.old)}%` : "-"),
      padder(`${Math.round(cS.now)}%`),
      padder(
        withSign(cS.diff) != null ? `${withSign(Math.round(cS.diff))}%` : "-"
      )
    ]),
    row([
      padder(mark(cF.diff)),
      padder("Functions"),
      padder(cF.old != null ? `${Math.round(cF.old)}%` : "-"),
      padder(`${Math.round(cF.now)}%`),
      padder(
        withSign(cF.diff) != null ? `${withSign(Math.round(cF.diff))}%` : "-"
      )
    ]),
    row([
      padder(mark(cB.diff)),
      padder("Branches"),
      padder(cB.old != null ? `${Math.round(cB.old)}%` : "-"),
      padder(`${Math.round(cB.now)}%`),
      padder(
        withSign(cB.diff) != null ? `${withSign(Math.round(cB.diff))}%` : "-"
      )
    ])
  ];

  const { maxWidths, width } = diagnostic(rows);
  const tHead = `@@${alignCenter("Coverage Diff", width - 4, " ")}@@`;
  const tBody = rows
    .map((row: RowTypes) => {
      switch (row.type) {
        case "raw":
          return row.value(width);
        case "row":
          return row.values
            .map((renderer, i) => renderer(maxWidths[i]))
            .join(" ");
        default:
          throw new Error("Unexpected type:" + JSON.stringify(row));
      }
    })
    .join(EOL);

  return "```diff\n" + tHead + "\n" + tBody + "\n```";
};

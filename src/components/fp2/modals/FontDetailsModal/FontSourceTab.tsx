/**
 * Font Source Tab
 * Displays all font tables in a collapsed tree view (like TTX output).
 * Uses getTableDirectory from RawTableParser and parseTable from tables/index.
 * All tables are parsed in the background at mount so status badges appear without expanding.
 */

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Popover } from "../../../../components/components/Popover";
import { getTableDirectory } from "../../../../engine/parsers/RawTableParser";
import { GROUP_ORDER, getGroupForTag, parseTable } from "../../../../engine/parsers/tables";
import { getDisplayData } from "../../../../engine/parsers/tables/displayEnrichers";
import {
  getTableDefinition,
  REFERENCE_TABLE_CLARIFIER,
} from "../../../../engine/parsers/tables/tableDefinitions";
import type { CachedFont } from "../../../../types/font.types";
import { ChevronDown, ChevronRight } from "../../../../utils/icons";
import styles from "./FontSourceTab.module.css";

interface FontTable {
  tag: string;
  offset: number;
  length: number;
  checksum?: number;
  hexDump: string;
  parsedData: unknown | null;
  status?: string;
  parsing?: boolean;
}

function getStatusLabel(status?: string): string {
  if (!status) return "";
  switch (status) {
    case "complete":
      return "Parsed";
    case "partial":
      return "Partial";
    case "not_implemented":
      return "Parser needed";
    case "error":
      return "Error";
    default:
      return status;
  }
}

function parseHexDumpLine(line: string): { offset: string; hex: string; ascii: string } | null {
  if (line.startsWith("...") || line.length < 10) return null;
  const offset = line.slice(0, 8);
  const rest = line.slice(10);
  const pipeIdx = rest.indexOf("  |");
  if (pipeIdx < 0) return { offset, hex: rest, ascii: "" };
  const hex = rest.slice(0, pipeIdx);
  const ascii = rest.slice(pipeIdx + 3).replace(/\|$/, "");
  return { offset, hex, ascii };
}

const TTC_MAGIC = 0x74746366; // 'ttcf'
const HEX_DUMP_MAX_BYTES = 4096;

function generateHexDump(data: ArrayBuffer, maxBytes = HEX_DUMP_MAX_BYTES): string {
  const view = new Uint8Array(data);
  const len = Math.min(view.length, maxBytes);
  const lines: string[] = [];
  const bytesPerLine = 16;

  for (let i = 0; i < len; i += bytesPerLine) {
    const offset = i.toString(16).toUpperCase().padStart(8, "0");
    const hexBytes: string[] = [];
    const asciiChars: string[] = [];

    for (let j = 0; j < bytesPerLine && i + j < len; j++) {
      const byte = view[i + j];
      hexBytes.push(byte.toString(16).toUpperCase().padStart(2, "0"));
      asciiChars.push(byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".");
    }

    while (hexBytes.length < bytesPerLine) {
      hexBytes.push("  ");
    }

    lines.push(`${offset}  ${hexBytes.join(" ")}  |${asciiChars.join("")}|`);
  }

  if (view.length > maxBytes) {
    lines.push(`\n... [truncated, total ${view.length} bytes]`);
  }

  return lines.join("\n");
}

export function FontSourceTab({ font }: { font: CachedFont }) {
  const [tables, setTables] = useState<FontTable[]>([]);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const buffer = font.fileData;
    cancelledRef.current = false;

    // TTC: not supported in this pass
    if (new DataView(buffer).getUint32(0, false) === TTC_MAGIC) {
      setError("Font is a TTC collection; only single fonts are supported.");
      setTables([]);
      setLoading(false);
      return;
    }

    const dir = getTableDirectory(buffer);
    const tableList: FontTable[] = dir.map((e) => {
      const slice = buffer.slice(e.offset, e.offset + e.length);
      const hexDump = generateHexDump(slice, HEX_DUMP_MAX_BYTES);
      return {
        tag: e.tag,
        offset: e.offset,
        length: e.length,
        checksum: e.checksum,
        hexDump,
        parsedData: null as unknown | null,
        parsing: true,
      };
    });

    tableList.sort((a, b) => {
      const ga = GROUP_ORDER.indexOf(getGroupForTag(a.tag) ?? "other");
      const gb = GROUP_ORDER.indexOf(getGroupForTag(b.tag) ?? "other");
      if (ga !== gb) return ga - gb;
      return a.tag.localeCompare(b.tag);
    });
    setTables(tableList);
    setError(null);
    setLoading(false);

    // Parse all tables in the background so status badges appear without expanding.
    for (const t of tableList) {
      (async () => {
        try {
          const r = await parseTable(t.tag, buffer, t.offset, t.length);
          if (cancelledRef.current) return;
          setTables((prev) =>
            prev.map((x) =>
              x.tag === t.tag ? { ...x, parsedData: r.parsed, status: r.status, parsing: false } : x
            )
          );
        } catch {
          if (cancelledRef.current) return;
          setTables((prev) =>
            prev.map((x) =>
              x.tag === t.tag
                ? {
                    ...x,
                    parsedData: { _: "Parse error" },
                    status: "error",
                    parsing: false,
                  }
                : x
            )
          );
        }
      })();
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [font]);

  const toggleTable = (tag: string) => {
    const next = new Set(expandedTables);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setExpandedTables(next);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading font tables...</div>;
  }

  if (!loading && !error && tables.length === 0) {
    return (
      <div className={styles.fontSourceTab}>
        <div className={styles.emptyState}>No tables found</div>
      </div>
    );
  }

  return (
    <div className={styles.fontSourceTab} role="list" aria-label="Font tables">
      <div className={styles.tableCount}>
        Found {tables.length} table{tables.length !== 1 ? "s" : ""}
      </div>
      {tables.map((table) => {
        const isExpanded = expandedTables.has(table.tag);
        const postData = tables.find((t) => t.tag === "post")?.parsedData;
        const toShow = getDisplayData(table.tag, table.parsedData, { post: postData ?? undefined });
        const def = getTableDefinition(table.tag);

        return (
          <div key={table.tag} className={styles.tableItem} role="listitem">
            <button
              type="button"
              className={styles.tableHeader}
              onClick={() => toggleTable(table.tag)}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className={styles.tableTag}>{table.tag}:</span>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <span
                    className={styles.definitionTrigger}
                    role="button"
                    tabIndex={0}
                    aria-label="Table definition"
                  >
                    <Info size={14} />
                  </span>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content side="right" align="start" sideOffset={8}>
                    <p className={styles.definitionText}>{def.definition}</p>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              {def.spec && <span className={styles.specBadge}>{def.spec}</span>}
              {getStatusLabel(table.status) && (
                <span
                  className={[
                    styles.statusBadge,
                    table.status &&
                      (styles as Record<string, string>)[`statusBadge--${table.status}`],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {getStatusLabel(table.status)}
                </span>
              )}
              <span className={styles.tableMeta}>
                {table.length} bytes @ 0x
                {table.offset.toString(16).toUpperCase().padStart(8, "0")}
              </span>
            </button>
            {isExpanded && (
              <div className={styles.tableContent}>
                {table.parsing && <div className={styles.dataTypeLabel}>Parsing…</div>}
                {def.reference && (
                  <div className={styles.referenceClarifier}>{REFERENCE_TABLE_CLARIFIER}</div>
                )}
                {table.parsedData != null && !table.parsing && (
                  <>
                    <div className={styles.dataTypeLabel}>
                      {def.reference ? "Quantities" : "Parsed Data"}
                    </div>
                    <pre className={styles.tableDataPre}>{JSON.stringify(toShow, null, 2)}</pre>
                  </>
                )}
                <div className={styles.dataTypeLabel}>Hex Dump</div>
                <div className={styles.hexDumpBlock}>
                  {table.hexDump.split("\n").map((line) => {
                    const parsed = parseHexDumpLine(line);
                    if (!parsed) {
                      return (
                        <div key={line || "truncation"} className={styles.hexDumpTruncation}>
                          {line}
                        </div>
                      );
                    }
                    return (
                      <div key={`${parsed.offset}-${parsed.hex}`} className={styles.hexDumpLine}>
                        <span className={styles.hexOffset}>{parsed.offset}</span>
                        {"  "}
                        <span className={styles.hexBytes}>{parsed.hex}</span>
                        {"  |"}
                        <span className={styles.hexAscii}>{parsed.ascii}</span>
                        {"|"}
                      </div>
                    );
                  })}
                </div>
                {table.checksum != null && (
                  <div className={styles.checksumLine}>
                    Checksum: 0x{table.checksum.toString(16)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Style matrix audit page.
 * Displays Button, Toggle, and ToggleGroup samples in row/column matrices
 * (states and variants) to inspect current styling and identify gaps.
 */

import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomToggleGroup } from "../components/components/ToggleGroup/CustomToggleGroup";
import { useSettingsStore } from "../stores/settingsStore";
import styles from "./StyleMatrixPage.module.css";

const BUTTON_ROWS = [
  { id: "default", label: "Default", state: "default" as const, style: "filled" as const },
  { id: "hover", label: "Hover", state: "hover" as const, style: "filled" as const },
  { id: "focus", label: "Focus", state: "focus" as const, style: "filled" as const },
  { id: "active", label: "Active", state: "active" as const, style: "filled" as const },
  { id: "ghost", label: "Ghost", state: "default" as const, style: "ghost" as const },
  { id: "disabled", label: "Disabled", state: "disabled" as const, style: "filled" as const },
  { id: "outlined", label: "Outlined", state: "default" as const, style: "outlined" as const },
] as const;

const BUTTON_COLUMNS = [
  { id: "primaryNeutral", label: "Primary (neutral)", withIcon: false },
  { id: "primaryNeutralIcon", label: "Primary + Icon", withIcon: true },
  { id: "accent", label: "Accent", withIcon: false },
  { id: "accentIcon", label: "Accent + Icon", withIcon: true },
  { id: "info", label: "Info", withIcon: false },
  { id: "warning", label: "Warning", withIcon: false },
  { id: "error", label: "Error", withIcon: false },
  { id: "success", label: "Success", withIcon: false },
] as const;

const TOGGLE_ROWS = [
  { id: "default", label: "Default", state: "default" as const, pressed: false },
  { id: "hover", label: "Hover", state: "hover" as const, pressed: false },
  { id: "focus", label: "Focus", state: "focus" as const, pressed: false },
  { id: "active", label: "Active", state: "active" as const, pressed: true },
  { id: "ghost", label: "Ghost", labelSuffix: "N/A" },
  { id: "disabled", label: "Disabled", state: "disabled" as const, pressed: false },
  { id: "outlined", label: "Outlined", labelSuffix: "N/A" },
] as const;

const TOGGLE_COLUMNS = [
  { id: "segmented", label: "Segmented" },
  { id: "discrete", label: "Discrete" },
] as const;

export function StyleMatrixPage() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Style matrix</h1>
          <div className={styles.themeControl}>
            <span className={styles.themeLabel}>Theme</span>
            <CustomToggleGroup.Root
              type="single"
              value={colorScheme}
              onValueChange={(value) => {
                if (value) setColorScheme(value as "system" | "light" | "dark");
              }}
              variant="segmented"
              className={styles.themeToggle}
              aria-label="Color scheme"
            >
              <CustomToggleGroup.Item value="system">System</CustomToggleGroup.Item>
              <CustomToggleGroup.Item value="light">Light</CustomToggleGroup.Item>
              <CustomToggleGroup.Item value="dark">Dark</CustomToggleGroup.Item>
            </CustomToggleGroup.Root>
          </div>
        </div>
        <Link to="/" className={styles.back}>
          ← Back to app
        </Link>
      </header>

      <section className={styles.section} aria-labelledby="button-matrix-heading">
        <h2 id="button-matrix-heading" className={styles.sectionTitle}>
          Buttons
        </h2>
        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.rowHeaderCell} />
                {BUTTON_COLUMNS.map((col) => (
                  <th key={col.id} scope="col" className={styles.colHeaderCell}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUTTON_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.rowHeaderCell}>
                    {row.label}
                  </th>
                  {BUTTON_COLUMNS.map((col) => (
                    <td key={col.id} className={styles.cell}>
                      <span
                        className={`${styles.buttonSample} ${styles[`btn_${col.id}`]}`}
                        data-state={row.state}
                        data-style={row.style}
                        aria-hidden
                      >
                        {col.withIcon && (
                          <span className={styles.buttonIcon} aria-hidden>
                            <Plus size={14} strokeWidth={2.5} />
                          </span>
                        )}
                        Label
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="toggle-matrix-heading">
        <h2 id="toggle-matrix-heading" className={styles.sectionTitle}>
          Toggles
        </h2>
        <p className={styles.sectionNote}>
          Only one visual variant (accent when pressed). Ghost/Outlined rows show N/A.
        </p>
        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.rowHeaderCell} />
                {TOGGLE_COLUMNS.map((col) => (
                  <th key={col.id} scope="col" className={styles.colHeaderCell}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOGGLE_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.rowHeaderCell}>
                    {row.label}
                    {"labelSuffix" in row && row.labelSuffix ? ` (${row.labelSuffix})` : ""}
                  </th>
                  {TOGGLE_COLUMNS.map((col) => (
                    <td key={col.id} className={styles.cell}>
                      {"labelSuffix" in row && row.labelSuffix ? (
                        <span className={styles.na}>—</span>
                      ) : (
                        <div
                          className={`${styles.toggleGroupSample} ${styles[`tg_${col.id}`]}`}
                          data-state={"state" in row ? row.state : "default"}
                          aria-hidden
                        >
                          <span className={styles.toggleItem}>A</span>
                          <span
                            className={styles.toggleItem}
                            data-pressed={"pressed" in row && row.pressed ? true : undefined}
                          >
                            B
                          </span>
                          <span className={styles.toggleItem}>C</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="togglegroup-matrix-heading">
        <h2 id="togglegroup-matrix-heading" className={styles.sectionTitle}>
          ToggleGroups
        </h2>
        <p className={styles.sectionNote}>
          Same as Toggles: segmented vs discrete layout only; accent when pressed.
        </p>
        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.rowHeaderCell} />
                {TOGGLE_COLUMNS.map((col) => (
                  <th key={col.id} scope="col" className={styles.colHeaderCell}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOGGLE_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.rowHeaderCell}>
                    {row.label}
                    {"labelSuffix" in row && row.labelSuffix ? ` (${row.labelSuffix})` : ""}
                  </th>
                  {TOGGLE_COLUMNS.map((col) => (
                    <td key={col.id} className={styles.cell}>
                      {"labelSuffix" in row && row.labelSuffix ? (
                        <span className={styles.na}>—</span>
                      ) : (
                        <div
                          className={`${styles.toggleGroupSample} ${styles[`tg_${col.id}`]}`}
                          data-state={"state" in row ? row.state : "default"}
                          aria-hidden
                        >
                          <span className={styles.toggleItem}>A</span>
                          <span
                            className={styles.toggleItem}
                            data-pressed={"pressed" in row && row.pressed ? true : undefined}
                          >
                            B
                          </span>
                          <span className={styles.toggleItem}>C</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className={styles.sectionTitle}>
          Gaps and omissions
        </h2>
        <ul className={styles.gapsList}>
          <li>
            <strong>Buttons:</strong> Semantic variants (Info, Warning, Error, Success) are not in
            the design system; matrix uses token-based placeholders. Primary (neutral) filled is not
            in tokens—only secondary (neutral outline). &quot;Outlined&quot; row = current
            Secondary.
          </li>
          <li>
            <strong>Toggles / ToggleGroups:</strong> No color or semantic variant API (only
            segmented vs discrete layout). No ghost or outlined variants; single accent-based look.
          </li>
          <li>
            <strong>Other:</strong> Size variants (sm/lg) and loading state exist in tokens but are
            not shown. Error maps to <code>--danger</code> in tokens.
          </li>
        </ul>
      </section>
    </div>
  );
}

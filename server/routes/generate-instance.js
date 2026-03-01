/**
 * Generate static font instance endpoint
 * Uses fonttools Python library to instantiate variable fonts
 */

import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const Filename = fileURLToPath(import.meta.url);
const Dirname = path.dirname(Filename);
const execAsync = promisify(exec);

export async function generateInstance(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No font file provided" });
  }

  const { axisValues, outputFormat = "ttf" } = req.body;
  if (!axisValues || typeof axisValues !== "object") {
    return res.status(400).json({ error: "Invalid axis values" });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(path.dirname(inputPath), `instance-${Date.now()}.${outputFormat}`);

  try {
    // Call Python script to generate instance
    const pythonScript = path.join(Dirname, "../utils/fonttools-wrapper.py");
    const axisValuesJson = JSON.stringify(axisValues);

    const { stderr } = await execAsync(
      `python3 "${pythonScript}" "${inputPath}" "${outputPath}" '${axisValuesJson}'`,
      { timeout: 30000 } // 30 second timeout
    );

    if (stderr && !stderr.includes("Warning")) {
      throw new Error(stderr);
    }

    // Read generated file
    const fileBuffer = await fs.readFile(outputPath);

    // Clean up temporary files
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    // Send file
    res.setHeader("Content-Type", `font/${outputFormat}`);
    res.setHeader("Content-Disposition", `attachment; filename="font-instance.${outputFormat}"`);
    res.send(fileBuffer);
  } catch (error) {
    // Clean up on error
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    console.error("Instance generation error:", error);
    res.status(500).json({
      error: "Failed to generate font instance",
      message: error.message,
    });
  }
}

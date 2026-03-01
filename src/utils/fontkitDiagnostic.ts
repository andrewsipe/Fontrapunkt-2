/**
 * Fontkit Diagnostic Test
 * Use this to verify fontkit installation and identify issues
 */

import * as fontkit from "fontkit";

/**
 * Test if fontkit is properly installed and can be imported
 */
export function testFontkitInstallation(): {
  success: boolean;
  error?: string;
  details: {
    fontkitExists: boolean;
    fontkitCreateExists: boolean;
    fontkitType: string;
    fontkitKeys: string[];
  };
} {
  try {
    const fontkitExists = typeof fontkit !== "undefined" && fontkit !== null;
    const fontkitCreateExists = typeof fontkit?.create === "function";
    const fontkitType = typeof fontkit;
    const fontkitKeys = fontkitExists ? Object.keys(fontkit) : [];

    return {
      success: fontkitExists && fontkitCreateExists,
      details: {
        fontkitExists,
        fontkitCreateExists,
        fontkitType,
        fontkitKeys,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        fontkitExists: false,
        fontkitCreateExists: false,
        fontkitType: "unknown",
        fontkitKeys: [],
      },
    };
  }
}

/**
 * Test if fontkit can parse a minimal font buffer
 * This creates a minimal valid TTF header to test parsing
 */
export function testFontkitParsing(arrayBuffer?: ArrayBuffer): {
  success: boolean;
  error?: string;
  details: {
    bufferProvided: boolean;
    bufferType: string;
    bufferSize: number;
    isArrayBuffer: boolean;
    fontkitCreated: boolean;
    fontProperties?: string[];
  };
} {
  try {
    // Check if fontkit is available
    if (!fontkit || typeof fontkit.create !== "function") {
      return {
        success: false,
        error: "fontkit.create is not available",
        details: {
          bufferProvided: false,
          bufferType: "N/A",
          bufferSize: 0,
          isArrayBuffer: false,
          fontkitCreated: false,
        },
      };
    }

    // If no buffer provided, create a minimal test buffer
    // This is a minimal valid TTF header (won't parse fully, but tests if fontkit.create() works)
    let testBuffer: ArrayBuffer;

    if (arrayBuffer) {
      testBuffer = arrayBuffer;
    } else {
      // Minimal TTF header - just enough to test if fontkit.create() accepts it
      // This will likely fail parsing, but tests if the function exists and can be called
      const minimalTTF = new Uint8Array([
        0x00,
        0x01,
        0x00,
        0x00, // sfntVersion (TTF)
        0x00,
        0x00, // numTables
        0x00,
        0x00, // searchRange
        0x00,
        0x00, // entrySelector
        0x00,
        0x00, // rangeShift
      ]);
      testBuffer = minimalTTF.buffer;
    }

    const details: {
      bufferProvided: boolean;
      bufferType: string;
      bufferSize: number;
      isArrayBuffer: boolean;
      fontkitCreated: boolean;
      fontProperties?: string[];
    } = {
      bufferProvided: !!arrayBuffer,
      bufferType: testBuffer.constructor.name,
      bufferSize: testBuffer.byteLength,
      isArrayBuffer: testBuffer instanceof ArrayBuffer,
      fontkitCreated: false,
    };

    // Try to create font
    try {
      // ts-expect-error - fontkit.create accepts ArrayBuffer at runtime, even if types say Buffer
      const font = fontkit.create(testBuffer);
      details.fontkitCreated = !!font;

      if (font) {
        // Get available properties
        details.fontProperties = Object.keys(font).slice(0, 20);
      }

      return {
        success: true,
        details,
      };
    } catch (parseError) {
      // Even if parsing fails, fontkit.create() was called successfully
      // The error tells us what went wrong
      return {
        success: false,
        error: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        details: {
          ...details,
          fontkitCreated: false,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        bufferProvided: false,
        bufferType: "N/A",
        bufferSize: 0,
        isArrayBuffer: false,
        fontkitCreated: false,
      },
    };
  }
}

/**
 * Comprehensive diagnostic test
 * Run this in the browser console or as a component test
 */
export async function runFontkitDiagnostic(file?: File): Promise<{
  installation: ReturnType<typeof testFontkitInstallation>;
  parsing: ReturnType<typeof testFontkitParsing>;
  fileParsing?: {
    success: boolean;
    error?: string;
    details: {
      fileName: string;
      fileSize: number;
      fileType: string;
    };
  };
}> {
  console.log("🔍 Running Fontkit Diagnostic Tests...\n");

  // Test 1: Installation
  console.log("1️⃣ Testing fontkit installation...");
  const installation = testFontkitInstallation();
  console.log("Installation test:", installation);

  if (!installation.success) {
    console.error("❌ Fontkit installation test failed!");
    console.error("Error:", installation.error);
    console.error("Details:", installation.details);
    return { installation, parsing: testFontkitParsing() };
  }

  console.log("✅ Fontkit is installed\n");

  // Test 2: Basic parsing (with minimal buffer)
  console.log("2️⃣ Testing fontkit.create() with minimal buffer...");
  const parsing = testFontkitParsing();
  console.log("Parsing test:", parsing);

  if (!parsing.success) {
    console.warn("⚠️ Fontkit parsing test failed (expected with minimal buffer)");
    console.warn("Error:", parsing.error);
  } else {
    console.log("✅ fontkit.create() works\n");
  }

  // Test 3: File parsing (if file provided)
  if (file) {
    console.log("3️⃣ Testing fontkit.create() with actual font file...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileParsing = testFontkitParsing(arrayBuffer);

      console.log("File parsing test:", fileParsing);

      if (fileParsing.success) {
        console.log("✅ Font file parsed successfully\n");
      } else {
        console.error("❌ Font file parsing failed");
        console.error("Error:", fileParsing.error);
        console.error("Details:", fileParsing.details);
      }

      return {
        installation,
        parsing,
        fileParsing: {
          success: fileParsing.success,
          error: fileParsing.error,
          details: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        },
      };
    } catch (error) {
      console.error("❌ Failed to read file:", error);
      return {
        installation,
        parsing,
        fileParsing: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          details: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        },
      };
    }
  }

  return { installation, parsing };
}

/**
 * Quick test function - call this from browser console
 * Usage: import { quickFontkitTest } from './utils/fontkitDiagnostic'; quickFontkitTest();
 */
export function quickFontkitTest(): void {
  console.log("=== Fontkit Quick Diagnostic ===\n");

  const result = runFontkitDiagnostic();

  result.then((diagnostic) => {
    console.log("\n=== Diagnostic Summary ===");
    console.log("Installation:", diagnostic.installation.success ? "✅ PASS" : "❌ FAIL");
    console.log("Parsing:", diagnostic.parsing.success ? "✅ PASS" : "⚠️ FAIL (may be expected)");

    if (diagnostic.installation.error) {
      console.error("\nInstallation Error:", diagnostic.installation.error);
    }
    if (diagnostic.parsing.error) {
      console.warn("\nParsing Error:", diagnostic.parsing.error);
    }

    console.log("\nFull Details:", diagnostic);
  });
}

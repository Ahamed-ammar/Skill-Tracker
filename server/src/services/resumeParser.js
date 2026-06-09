import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

/**
 * Convert PDF or DOCX buffer → plain text string.
 * Throws an Error with a user-friendly message on failure.
 *
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @returns {Promise<string>}
 */
export async function parseResume(fileBuffer, filename) {
  if (fileBuffer.length > MAX_FILE_BYTES) {
    throw new Error(`File too large (max ${MAX_FILE_MB} MB).`);
  }

  const name = filename.toLowerCase().trim();
  console.log(
    `[resumeParser] file=${filename}  size=${fileBuffer.length} bytes`
  );

  // ── PDF ──────────────────────────────────────────────────────────────────────
  if (name.endsWith(".pdf")) {
    let data;
    try {
      data = await pdfParse(fileBuffer);
    } catch (e) {
      throw new Error(`Could not open PDF: ${e.message}`);
    }

    const text = (data.text || "").trim();
    if (!text) {
      throw new Error(
        "No text found in PDF. " +
          "Make sure it is a text-based PDF (not a scanned image). " +
          "Try copy-pasting text from the PDF to verify."
      );
    }

    console.log(`[resumeParser] extracted ${text.length} chars from PDF`);
    return text;
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────────
  if (name.endsWith(".docx")) {
    let result;
    try {
      result = await mammoth.extractRawText({ buffer: fileBuffer });
    } catch (e) {
      throw new Error(`Could not open DOCX: ${e.message}`);
    }

    const text = (result.value || "").trim();
    if (!text) {
      throw new Error("No text found in DOCX file.");
    }

    console.log(`[resumeParser] extracted ${text.length} chars from DOCX`);
    return text;
  }

  throw new Error(
    `Unsupported file type '${filename}'. ` +
      "Please upload a PDF (.pdf) or Word document (.docx)."
  );
}

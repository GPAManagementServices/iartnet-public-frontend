/**
 * Configurazione worker PDF.js (browser). Chiamare prima di getDocument.
 */
let workerConfigured = false

export async function configurePdfJsWorker(): Promise<void> {
  if (import.meta.server || workerConfigured)
    return
  const pdfjs = await import('pdfjs-dist')
  const workerMod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  const src = typeof workerMod.default === 'string' ? workerMod.default : String(workerMod.default)
  pdfjs.GlobalWorkerOptions.workerSrc = src
  workerConfigured = true
}

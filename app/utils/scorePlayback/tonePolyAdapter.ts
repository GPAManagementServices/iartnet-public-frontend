import { Frequency, Sampler, start, Volume } from 'tone'

import {
  buildSparseSalamanderUrlMap,
  DEFAULT_PIANO_SAMPLE_BASE_URL,
} from '~/utils/scorePlayback/pianoSampleUrls'

const sparseUrls = buildSparseSalamanderUrlMap()

let masterVolume: Volume | null = null
let pianoSampler: Sampler | null = null
let samplerBaseUrl: string | null = null

/** noteId Verovio → nota scientifica usata in triggerRelease (stessa di attack). */
const activeNoteById = new Map<string, string>()

function normalizeBaseUrl(url: string): string {
  const t = url.trim()
  if (!t)
    return DEFAULT_PIANO_SAMPLE_BASE_URL
  return t.endsWith('/') ? t : `${t}/`
}

function disposeSampler(): void {
  if (pianoSampler) {
    try {
      pianoSampler.releaseAll()
    }
    catch {
      /* ignore */
    }
    pianoSampler.dispose()
    pianoSampler = null
  }
  samplerBaseUrl = null
}

/**
 * Avvia il contesto audio e carica il campionatore (prima volta o dopo `disposeTonePlayback`).
 * @param sampleBaseUrl Origine dei `.mp3` (default Salamander Tone.js).
 */
export async function ensureTonePlayback(sampleBaseUrl?: string): Promise<void> {
  await start()
  if (!masterVolume) {
    masterVolume = new Volume(-8).toDestination()
  }

  const base = normalizeBaseUrl(sampleBaseUrl ?? DEFAULT_PIANO_SAMPLE_BASE_URL)

  if (pianoSampler && samplerBaseUrl === base && pianoSampler.loaded)
    return

  disposeSampler()
  samplerBaseUrl = base

  await new Promise<void>((resolve, reject) => {
    try {
      pianoSampler = new Sampler({
        urls: sparseUrls,
        baseUrl: base,
        attack: 0.002,
        release: 0.45,
        onload: () => resolve(),
        onerror: err => reject(err),
      }).connect(masterVolume!)
    }
    catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

export function toneNoteOn(noteId: string, midiPitch: number): void {
  if (!pianoSampler?.loaded || activeNoteById.has(noteId))
    return
  const note = Frequency(midiPitch, 'midi').toNote()
  pianoSampler.triggerAttack(note, undefined, 0.72)
  activeNoteById.set(noteId, note)
}

export function toneNoteOff(noteId: string): void {
  const note = activeNoteById.get(noteId)
  if (!note || !pianoSampler?.loaded)
    return
  activeNoteById.delete(noteId)
  pianoSampler.triggerRelease(note)
}

export function toneReleaseAll(): void {
  activeNoteById.clear()
  pianoSampler?.releaseAll()
}

export function disposeTonePlayback(): void {
  activeNoteById.clear()
  disposeSampler()
  if (masterVolume) {
    masterVolume.dispose()
    masterVolume = null
  }
}

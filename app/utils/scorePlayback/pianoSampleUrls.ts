/**
 * Campioni Salamander (Alexander Holm) usati negli esempi Tone.js.
 * @see https://tonejs.github.io/audio/salamander/ — licenza in quella directory.
 *
 * Griglia nativa del set: terza minore (C, Ds, Fs, A per ottava). Qui carichiamo
 * un sottoinsieme ogni **6 semitoni** su quella griglia (interpolazione Tone tra i punti).
 */

export const DEFAULT_PIANO_SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

/** Pitch class → prefisso file Salamander (solo 0, 3, 6, 9). */
const PC_TO_STEM: Record<number, 'C' | 'Ds' | 'Fs' | 'A'> = {
  0: 'C',
  3: 'Ds',
  6: 'Fs',
  9: 'A',
}

function midiToSalamanderFile(midi: number): string {
  const pc = midi % 12
  const stem = PC_TO_STEM[pc]
  if (!stem)
    throw new Error(`MIDI ${midi} non sulla griglia Salamander (atteso pc ∈ {0,3,6,9})`)
  const octave = Math.floor(midi / 12) - 1
  return `${stem}${octave}.mp3`
}

/** URL sparsi: chiavi MIDI → solo nome file (con `baseUrl` in Sampler). */
export function buildSparseSalamanderUrlMap(): Record<number, string> {
  const out: Record<number, string> = {}
  for (let midi = 21; midi <= 105; midi += 6)
    out[midi] = midiToSalamanderFile(midi)
  out[108] = 'C8.mp3'
  return out
}

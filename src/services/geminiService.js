import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config/env.js';

let aiClient = null;

const getAiClient = () => {
  if (!aiClient) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('GEMINI_API_KEY belum dikonfigurasi di file .env. Dapatkan API key gratis di https://aistudio.google.com');
    }
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiClient;
};

/**
 * Ask Gemini to recommend a movie grounded strictly within the local database.
 * 
 * @param {string} userPrompt - Mood, preference, or description from user
 * @param {Array} candidateMovies - List of movies fetched from local SQLite
 * @returns {Promise<{ movie_id: number, reasoning: string }>}
 */
export const getGroundedRecommendation = async (userPrompt, candidateMovies) => {
  const ai = getAiClient();

  const candidateSummary = candidateMovies.map(m => ({
    id: m.id,
    title: m.title,
    year: m.year,
    genres: m.genres,
    director: m.director,
    rating: m.rating,
    synopsis: m.synopsis
  }));

  const systemInstruction = `
Kamu adalah kurator film cerdas dan berwawasan luas untuk aplikasi FilmLog.
Tugas utamamu adalah merekomendasikan film kepada pengguna berdasarkan preferensi, suasana hati (mood), genre, atau alur cerita yang mereka minta.

ATURAN PALING KRUSIAL (GROUNDING CONSTRAINT):
1. Kamu HANYA BOLEH merekomendasikan film yang BENAR-BENAR TERDAFTAR dalam daftar film kandidat lokal di bawah ini.
2. DILARANG KERAS merekomendasikan film di luar daftar kandidat yang diberikan, betapapun populernya film tersebut.
3. Analisis permintaan pengguna, cari film dari daftar kandidat yang memiliki elemen tematik, genre, atau atmosfer paling mendekati.
4. Berikan penjelasan (reasoning) yang menarik, logis, dan persuasif dalam Bahasa Indonesia mengapa film tersebut sangat cocok untuk pengguna.
5. Kembalikan jawaban HANYA dalam format JSON valid dengan struktur:
{
  "movie_id": <angka ID film yang dipilih dari daftar kandidat>,
  "reasoning": "<penjelasan lengkap dalam Bahasa Indonesia>"
}
`.trim();

  const userContent = `
Berikut adalah 20 Film yang tersedia di database lokal kami:
${JSON.stringify(candidateSummary, null, 2)}

Permintaan/Keinginan Pengguna:
"${userPrompt}"

Pilihlah 1 film terbaik dari daftar kandidat di atas dan berikan alasannya dalam JSON:
`.trim();

  // Call Gemini model (prioritize gemini-3.5-flash-lite for instant response and reliability)
  let response;
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-lite-latest'];

  let lastError;
  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        model: model,
        contents: userContent,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json'
        }
      });
      if (response && response.text) break;
    } catch (err) {
      console.warn(`[Gemini Model ${model} Warning]:`, err.message || err.status);
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error('Gagal mendapatkan respons dari Gemini API.');
  }

  const responseText = response.text ? response.text.trim() : '';

  try {
    const parsed = JSON.parse(responseText);
    const chosenId = parseInt(parsed.movie_id, 10);

    // Verify chosen movie actually exists in candidates
    const movieExists = candidateMovies.some(m => m.id === chosenId);
    if (!movieExists) {
      throw new Error(`Model merekomendasikan movie_id ${chosenId} yang tidak ada dalam daftar lokal.`);
    }

    return {
      movie_id: chosenId,
      reasoning: parsed.reasoning || 'Film ini direkomendasikan karena paling sesuai dengan preferensi Anda.'
    };
  } catch (parseError) {
    console.error('Failed to parse Gemini response as JSON:', responseText);
    throw new Error(`Format respon AI tidak valid: ${parseError.message}`);
  }
};

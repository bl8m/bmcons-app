import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

/**
 * Invia un PDF a Claude e ne estrae i dati tabellari in un formato
 * strutturato conforme allo schema zod passato.
 *
 * Quando le entità di dominio saranno definite, ogni tipo di documento
 * (es. fattura, listino, ecc.) avrà il proprio schema zod dedicato,
 * passato qui come parametro invece di scriverne uno generico.
 *
 * @param {Buffer} pdfBuffer - contenuto del PDF
 * @param {import('zod').ZodTypeAny} schema - schema zod dell'output atteso
 * @param {string} [instructions] - istruzioni aggiuntive per l'estrazione
 */
export async function extractStructuredDataFromPdf(pdfBuffer, schema, instructions) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new ApiError(500, 'ANTHROPIC_API_KEY non configurata');
  }

  // Limite richiesta con PDF in base64: 32MB.
  if (pdfBuffer.length > 32 * 1024 * 1024) {
    throw new ApiError(413, 'Il PDF supera la dimensione massima di 32MB');
  }

  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBuffer.toString('base64'),
            },
          },
          {
            type: 'text',
            text:
              instructions ||
              'Estrai tutti i dati delle tabelle presenti in questo documento, secondo lo schema richiesto.',
          },
        ],
      },
    ],
    output_config: {
      format: zodOutputFormat(schema),
    },
  });

  if (!response.parsed_output) {
    throw new ApiError(422, "Impossibile estrarre dati strutturati dal PDF");
  }

  return response.parsed_output;
}

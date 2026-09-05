import Anthropic, {
  AuthenticationError,
  RateLimitError,
  APIConnectionError,
  APIError,
} from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { loanInstallmentImportSchema } from '../validators/loanInstallmentImportSchema.js';

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
 * @param {number} [maxTokens] - limite di token in output (piani di
 *   ammortamento lunghi possono generare molte righe)
 */
export async function extractStructuredDataFromPdf(pdfBuffer, schema, instructions, maxTokens = 16000) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new ApiError(500, 'ANTHROPIC_API_KEY non configurata');
  }

  // Limite richiesta con PDF in base64: 32MB.
  if (pdfBuffer.length > 32 * 1024 * 1024) {
    throw new ApiError(413, 'Il PDF supera la dimensione massima di 32MB');
  }

  // Streaming invece di .parse(): l'SDK rifiuta le richieste non-streaming
  // quando il max_tokens richiesto potrebbe richiedere più di 10 minuti
  // (succede già a partire da ~21000 con questo modello), e i piani di
  // ammortamento lunghi possono generare molto output.
  const stream = client.messages.stream({
    model: 'claude-opus-5',
    max_tokens: maxTokens,
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

  let response;
  try {
    response = await stream.finalMessage();
  } catch (error) {
    // Catena dal più specifico: distingue gli errori che vale la pena
    // mostrare chiaramente (credenziali, rate limit) da un generico 502.
    if (error instanceof AuthenticationError) {
      throw new ApiError(
        500,
        'Chiave API Anthropic non valida: verifica ANTHROPIC_API_KEY nel file .env del backend'
      );
    }
    if (error instanceof RateLimitError) {
      throw new ApiError(429, 'Limite di richieste Anthropic superato, riprova tra qualche istante');
    }
    if (error instanceof APIConnectionError) {
      throw new ApiError(502, 'Impossibile contattare le API di Anthropic');
    }
    if (error instanceof APIError) {
      throw new ApiError(502, `Errore dall'API Anthropic: ${error.message}`);
    }
    throw error;
  }

  if (!response.parsed_output) {
    throw new ApiError(422, 'Impossibile estrarre dati strutturati dal PDF');
  }

  return response.parsed_output;
}

/**
 * Estrae il piano di ammortamento (elenco rate) da un PDF di mutuo.
 * Ritorna { installments: [...] } con i tipi "grezzi" dello schema di
 * estrazione (dueDate come stringa) — la normalizzazione verso i tipi reali
 * del DB avviene a valle, in loanImportController.js.
 */
export function extractLoanInstallmentsFromPdf(pdfBuffer) {
  return extractStructuredDataFromPdf(
    pdfBuffer,
    loanInstallmentImportSchema,
    'Questo documento contiene il piano di ammortamento di un mutuo. Estrai tutte le rate ' +
      'elencate, con: numero progressivo, data di scadenza (formato YYYY-MM-DD), importo ' +
      'totale della rata, quota capitale, quota interessi, debito residuo dopo il pagamento ' +
      'della rata ed eventuali oneri/spese aggiuntive se presenti. Includi ogni riga della ' +
      'tabella, anche se il piano è lungo.',
    // Un piano di ammortamento lungo (es. mutuo trentennale mensile) può
    // generare centinaia di righe: margine più ampio del default.
    32000
  );
}

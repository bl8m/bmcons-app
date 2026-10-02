import { z } from 'zod';
import { optionalString } from './common.js';

// Tipi di entità a cui è attualmente possibile collegare un allegato.
// Elenco esplicito (non un campo libero) per evitare refusi lato client;
// va esteso man mano che la tab Allegati viene aggiunta ad altre entità.
export const ATTACHABLE_TYPES = ['Customer'];

const objectIdField = (message) => z.string().trim().regex(/^[0-9a-fA-F]{24}$/, message);

export const createAttachmentSchema = z.object({
  attachableType: z.enum(ATTACHABLE_TYPES, { message: 'Tipo di entità non valido' }),
  attachableId: objectIdField('Entità di riferimento non valida'),
  name: optionalString(),
  version: optionalString(),
});

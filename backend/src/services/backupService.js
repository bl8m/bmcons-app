import { Customer } from '../models/Customer.js';
import { Address } from '../models/Address.js';
import { Phone } from '../models/Phone.js';
import { EmailAddress } from '../models/EmailAddress.js';
import { Bank } from '../models/Bank.js';
import { BankAccount } from '../models/BankAccount.js';
import { Loan } from '../models/Loan.js';
import { LoanInstallment } from '../models/LoanInstallment.js';

// Registro esplicito (non introspezione automatica dei modelli Mongoose)
// delle collection incluse nel backup: così si esclude deliberatamente
// "User" e si ha un unico punto da aggiornare quando si aggiungono entità.
export const BACKUP_MODELS = {
  customers: Customer,
  addresses: Address,
  phones: Phone,
  emailAddresses: EmailAddress,
  banks: Bank,
  bankAccounts: BankAccount,
  loans: Loan,
  loanInstallments: LoanInstallment,
};

// Un unico oggetto JSON con un array di documenti per collection. ObjectId e
// Date vengono serializzati automaticamente come stringhe da JSON.stringify;
// in importDatabase Mongoose li ricasta al tipo giusto in base allo schema.
export async function exportDatabase() {
  const data = {
    _meta: {
      app: 'bmcons',
      version: 1,
      exportedAt: new Date().toISOString(),
    },
  };

  for (const [key, Model] of Object.entries(BACKUP_MODELS)) {
    data[key] = await Model.find().lean();
  }

  return data;
}

// Sovrascrive (cancella e reinserisce) solo le collection effettivamente
// presenti nel file importato; chiavi sconosciute o assenti vengono
// ignorate, le altre collection non toccate restano invariate.
//
// Non atomico tra collection diverse: MongoDB standalone (senza replica set,
// come nel nostro docker-compose) non supporta transazioni multi-documento
// multi-collection. Se l'importazione si interrompe a metà, le collection
// già processate restano nel nuovo stato.
export async function importDatabase(data) {
  const imported = {};

  for (const [key, Model] of Object.entries(BACKUP_MODELS)) {
    const docs = data[key];
    if (!Array.isArray(docs)) continue;

    await Model.deleteMany({});
    if (docs.length > 0) {
      await Model.insertMany(docs, { ordered: false });
    }
    imported[key] = docs.length;
  }

  return imported;
}

// Plugin Mongoose riutilizzabile: quando un documento viene salvato con
// isPrimary=true, toglie automaticamente il flag agli altri documenti dello
// stesso "scope" (es. stesso customerId), così ce n'è sempre al più uno.
export function exclusivePrimaryPlugin(schema, { scopeField }) {
  async function unsetOthers(doc) {
    if (!doc?.isPrimary) return;
    await doc.constructor.updateMany(
      { [scopeField]: doc[scopeField], _id: { $ne: doc._id } },
      { $set: { isPrimary: false } }
    );
  }

  // Copre Model.create() / document.save()
  schema.post('save', unsetOthers);

  // Copre Model.findOneAndUpdate() / findByIdAndUpdate() (usato dai controller)
  schema.post('findOneAndUpdate', unsetOthers);
}

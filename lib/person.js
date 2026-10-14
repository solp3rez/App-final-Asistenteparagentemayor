import { pbRequest } from './pocketbase';

const COLLECTION = 'people';

function normalizePerson(record) {
  if (!record) return null;

  return {
    ...record,
    relation: record.relation ?? record.realiton ?? '',
    avatar: record.avatar ?? record.avartar ?? '',
  };
}

export async function getLinkedPerson() {
  try {
    const result = await pbRequest(COLLECTION);
    return normalizePerson(result.items?.[0] ?? null);
  } catch (error) {
    console.error('Error al consultar personas:', error);
    return null;
  }
}

export async function saveLinkedPerson(person) {
  const data = {
    name: person.name,
    realiton: person.realiton ?? person.relation ?? '',
    avartar: person.avartar ?? person.avatar ?? '',
  };

  try {
    const record = await pbRequest(COLLECTION, {
      method: 'POST',
      body: data,
    });

    return normalizePerson(record);
  } catch (error) {
    console.error('Error al guardar persona:', error);
    throw error;
  }
}

export async function clearLinkedPerson() {
  console.warn('La eliminación de personas todavía no está conectada a PocketBase.');
}

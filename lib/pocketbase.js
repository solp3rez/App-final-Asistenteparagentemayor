const POCKETBASE_URL = 'http://10.56.2.22:8090';

export async function pbRequest(collection, options = {}) {
  const response = await fetch(
    `${POCKETBASE_URL}/api/collections/${collection}/records`,
    {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(`PocketBase: ${response.status} ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

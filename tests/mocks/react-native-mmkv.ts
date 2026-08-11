const instances = new Map<string, Map<string, string>>();

export function createMMKV(configuration?: { id?: string }) {
  const id = configuration?.id ?? 'mmkv.default';
  const values = instances.get(id) ?? new Map<string, string>();
  instances.set(id, values);

  return {
    getString: (key: string) => values.get(key),
    remove: (key: string) => values.delete(key),
    set: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

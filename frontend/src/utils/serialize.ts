export const serializeMap = (map: Map<any, any>) => {
  return JSON.stringify(Array.from(map.entries()));
};

export const deserializeMap = <K, V>(map: string) => {
  return new Map<K, V>(JSON.parse(map));
};

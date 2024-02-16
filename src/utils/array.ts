

export const getRandomItem = <T>(arr: T[]): T =>
  arr[randomIndex(arr)] ?? null;

const randomIndex = (arr: unknown[]): number =>
  arr && arr.length ? Math.floor(Math.random() * arr.length) : -1;

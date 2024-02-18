

export const getRandomItem = <T>(arr: T[]): T | undefined =>
  arr[randomIndex(arr)] ?? undefined;

const randomIndex = (arr: unknown[]): number =>
  arr && arr.length ? Math.floor(Math.random() * arr.length) : -1;

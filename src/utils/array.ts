export const getRandomString = (arr: string[]): string =>
  arr[randomIndex(arr)] ?? "";

const randomIndex = (arr: any[]): number =>
  arr && arr.length ? Math.floor(Math.random() * arr.length) : -1;

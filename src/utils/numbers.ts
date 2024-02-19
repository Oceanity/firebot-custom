export const getRandomInteger = (max: number, min: number = 0): number =>
  Math.floor(Math.random() * (max - min)) + min;

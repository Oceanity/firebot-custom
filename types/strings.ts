export type StringOfLength<Min extends number, Max extends number> = string & {
  _min: Min;
  _max: Max;
  readonly StringOfLength: unique symbol;
};

export const isStringOfLength = <Min extends number, Max extends number>(
  str: string,
  min: Min,
  max: Max,
): str is StringOfLength<Min, Max> => str.length >= min && str.length <= max;

export const stringOfLength = <Min extends number, Max extends number>(
  input: unknown,
  min: Min,
  max: Max,
): StringOfLength<Min, Max> => {
  if (typeof input !== "string") {
    throw new Error("Input is not a string");
  }

  if (!isStringOfLength(input, min, max)) {
    throw new Error("Input is not between specified min and max");
  }

  return input;
};

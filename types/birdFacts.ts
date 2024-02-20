export type BirdFact = {
  id: number,
  bird: Bird,
  message: string,
  topic?: string
}

export type Bird = {
  name: string,
  id: number,
  sciName: string,
  family: string,
  order: string,
}

export type CreateLoadingMessageRequest = {
  message: string;
}

export type BirdFact = {
  id?: number,
  bird: Bird,
  message: string,
  topic?: string
  iNatData?: iNaturalistData
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

export type UpdateLoadingMessageRequest = {
  search: string;
  replace: string;
}

export type DeleteLoadingMessageRequest = {
  search: string;
}


export type CreateTopicRequest = {
  topic: string;
}

export type UpdateTopicRequest = {
  search: string;
  replace: string;
}

export type DeleteTopicRequest = CreateTopicRequest;

export type iNaturalistData = {
  id: string,
  photo_url: string,
  photo_attribution: string
}

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

export type UpdateLoadingMessageRequest = {
  oldMessage: string;
  newMessage: string;
}

export type DeleteLoadingMessageRequest = CreateLoadingMessageRequest;


export type CreateTopicRequest = {
  topic: string;
}

export type UpdateTopicRequest = {
  oldTopic: string;
  newTopic: string;
}

export type DeleteTopicRequest = CreateTopicRequest;

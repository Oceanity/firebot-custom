export type CreateTopicRequest = {
  topic: string;
}

export type UpdateTopicRequest = {
  search: string;
  replace: string;
}

export type DeleteTopicRequest = CreateTopicRequest;

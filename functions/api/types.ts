export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

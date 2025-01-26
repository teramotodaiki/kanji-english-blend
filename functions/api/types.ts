export interface Env {
  DEEPSEEK_API_KEY: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

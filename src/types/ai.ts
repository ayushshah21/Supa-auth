export interface AIResponse {
  content: string;
  error?: string;
}

export interface AIRequestParams {
  ticketContent: string;
  previousMessages?: string[];
} 
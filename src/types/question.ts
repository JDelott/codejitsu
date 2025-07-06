export interface Question {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Example[];
  constraints: string[];
  starter: string;
  solution?: string;
  hints?: string[];
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface TestCase {
  input: (number | string | boolean | number[] | string[] | null)[];
  expectedOutput: number | string | boolean | number[] | string[] | null;
  description?: string;
}

export type Category = 'All' | 'Arrays' | 'Stack' | 'Trees' | 'Linked Lists' | 'Dynamic Programming' | 'Graphs' | 'Strings'; 

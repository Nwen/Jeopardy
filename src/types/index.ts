export interface Question {
  value: number;
  question: string;
  answer: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Grid {
  id: string;
  name: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export type GridListItem = Pick<Grid, 'id' | 'name' | 'createdAt' | 'updatedAt'>;

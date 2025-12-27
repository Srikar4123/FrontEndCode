export interface Books {
  id: number;
  title: string;
  description: string;
  author: string;
  imageUrl?: string | null;
  price: number;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookDto {
  title: string;
  description?: string;
  author: string;
  imageUrl?: string | null;
  price: number;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

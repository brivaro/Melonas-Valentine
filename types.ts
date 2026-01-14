export type Category = 'Romántico' | 'Aventura' | 'Picante' | 'Pareja';

export interface DateTicket {
  id: string;
  emoji: string; // Emoji displayed on the front
  title: string; // Short title
  description: string; // The full plan revealed on the back
  category: Category;
}
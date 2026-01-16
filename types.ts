export type Category = 'Romántico' | 'Aventura' | 'Picante' | 'Pareja';

export interface DateTicket {
  id: string;
  emoji: string; // Emoji displayed on the front
  title: string; // Short title
  description: string; // The full plan revealed on the back
  category: Category;
  image: string; // Path to the image file
  cardLabel?: string; // Optional custom label (overrides default "Vale por..." / "Solo para ti...")
}
export interface BonusCard {
  id: number;
  "Bonus card": string;
  Set: string;
  Automa: string | null;
  Condition: string;
  "Explanatory text": string | null;
  VP: string | null;
  "%": number | string;
  Note: string | null;
  "VP Average": number;
  CardType: string;
  rulings: { text: string; source: string }[];
}

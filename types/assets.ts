export interface IItem {
  name: string;
  icon: string;
}

export interface IStage {
  name: string;
  code: string;
  ap: number;
  items: string[];
}

export type IAssetItems = Record<string, IItem>;
export type IAssetStages = Record<string, IStage>;

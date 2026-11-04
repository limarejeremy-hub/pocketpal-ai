export type RoleplayMode = 'interactive' | 'autonomous';

export interface CharacterProfile {
  id: string;
  name: string;
  age?: number;
  profession?: string;
  personality: string[];
  speakingStyle?: string;
  history?: string;
  language: string;
}

export interface SceneState {
  location?: string;
  time?: string;
  situation?: string;
  activeCharacters: string[];
  relationshipState?: string;
  unresolvedEvents: string[];
}

export interface RoleplayMemory {
  id: string;
  kind:
    | 'person'
    | 'relationship'
    | 'event'
    | 'preference'
    | 'place'
    | 'timeline'
    | 'promise'
    | 'other';
  text: string;
  importance: number;
  createdAt: number;
}

export interface RoleplayContext {
  character: CharacterProfile;
  scene: SceneState;
  memories?: RoleplayMemory[];
  rollingSummary?: string;
  mode?: RoleplayMode;
}

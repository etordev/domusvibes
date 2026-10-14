export interface CreateHomeRequest {
  name: string;
  ownerUserId: string;
}

export interface CreateHomeResponse {
  homeId: string;
}

export interface HomeListItem {
  id: string;
  name: string;
  role: string;
  score: number | null;
}

export interface HomeMember {
  userId: string;
  name: string;
  role: string;
}

export interface HomeDetails {
  id: string;
  name: string;
  members: HomeMember[];
}

export interface JoinHomeRequest {
  userId: string;
  homeId: string;
}

export interface JoinHomeResponse {
  joined: boolean;
}

export interface JoinHomeByInviteRequest {
  userId: string;
  inviteCode: string;
}

export interface JoinHomeByInviteResponse {
  joined: boolean;
}

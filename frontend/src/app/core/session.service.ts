import { Injectable } from '@angular/core';

const TOKEN = 'token';
const USER_ID = 'userId';
const USER_NAME = 'userName';
const USER_EMAIL = 'userEmail';

export interface SignedInUser {
  id: string;
  name: string;
  token: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  save(user: SignedInUser) {
    localStorage.setItem(TOKEN, user.token);
    localStorage.setItem(USER_ID, user.id);
    localStorage.setItem(USER_NAME, user.name);
    localStorage.setItem(USER_EMAIL, user.email);
  }

  token(): string | null {
    return this.read(TOKEN);
  }

  userId(): string | null {
    return this.read(USER_ID);
  }

  clear() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER_ID);
    localStorage.removeItem(USER_NAME);
    localStorage.removeItem(USER_EMAIL);
  }

  private read(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
}

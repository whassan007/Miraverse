import { signal, Injectable, computed } from '@angular/core';
import { Product } from '../components/shop/shop.component';

export type View = 'home' | 'shop' | 'stories' | 'about' | 'chat' | 'resources' | 'help' | 'contact' | 'privacy-safety' | 'terms' | 'login' | 'register' | 'profileSelection' | 'dashboard' | 'wishlist' | 'redeem' | 'pinLogin' | 'community' | 'game';

// Define interfaces for user structure
export interface ChildProfile {
  id: number;
  name: string;
  age: number;
  avatar: string; // URL to an avatar image
  tokenBalance: number;
  wishlist: Product[];
  pin: string; // 4-digit PIN
}

export interface ParentUser {
  id: number;
  name: string;
  email: string;
  children: ChildProfile[];
}

// Active profile can be a parent or a child
export type ActiveProfile = (Omit<ParentUser, 'children'> & { type: 'parent' }) | (ChildProfile & { type: 'child' });

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly MAX_PIN_ATTEMPTS = 3;

  // Mock data
  private mockUsers: ParentUser[] = [
    {
      id: 1,
      name: 'Amelie',
      email: 'parent@miraverse.com',
      children: [
        { 
          id: 101, 
          name: 'Leo', 
          age: 8, 
          avatar: 'https://picsum.photos/seed/leo/200', 
          tokenBalance: 150, 
          wishlist: [],
          pin: '1234'
        },
        { 
          id: 102, 
          name: 'Chloe', 
          age: 6, 
          avatar: 'https://picsum.photos/seed/chloe/200', 
          tokenBalance: 75, 
          wishlist: [],
          pin: '5678'
        },
      ],
    },
  ];

  loggedInUser = signal<ParentUser | null>(null);
  activeProfile = signal<ActiveProfile | null>(null);

  // Centralized navigation state
  activeView = signal<View>('home');

  // State for PIN Login Flow
  profileForPinLogin = signal<(ChildProfile & { type: 'child' }) | null>(null);
  failedPinAttempts = signal<number>(0);
  isLockedOut = signal<boolean>(false);

  setView(view: View) {
    this.activeView.set(view);
    window.scrollTo(0, 0);
  }

  login(email: string, password: string): boolean {
    // In a real app, this would be an API call.
    if (email.toLowerCase() === 'parent@miraverse.com' && password === 'password123') {
      const user = this.mockUsers[0];
      this.loggedInUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.loggedInUser.set(null);
    this.activeProfile.set(null);
    this.clearProfileForPinLogin();
    this.setView('home');
  }

  setActiveProfile(profile: ActiveProfile) {
    this.activeProfile.set(profile);
  }
  
  clearActiveProfile() {
    this.activeProfile.set(null);
    this.clearProfileForPinLogin();
  }
  
  setProfileForPinLogin(profile: ChildProfile & { type: 'child' }) {
    this.profileForPinLogin.set(profile);
    this.failedPinAttempts.set(0);
    this.isLockedOut.set(false);
  }

  clearProfileForPinLogin() {
    this.profileForPinLogin.set(null);
    this.failedPinAttempts.set(0);
    this.isLockedOut.set(false);
  }

  validatePin(pin: string): { success: boolean, message: string } {
    if (this.isLockedOut()) {
      return { success: false, message: 'Too many failed attempts. Profile is locked.' };
    }

    const profile = this.profileForPinLogin();
    if (!profile) {
      return { success: false, message: 'No profile selected for login.' };
    }

    if (profile.pin === pin) {
      this.setActiveProfile(profile);
      this.clearProfileForPinLogin();
      return { success: true, message: 'PIN correct!' };
    } else {
      this.failedPinAttempts.update(n => n + 1);
      const remaining = this.MAX_PIN_ATTEMPTS - this.failedPinAttempts();
      if (remaining <= 0) {
        this.isLockedOut.set(true);
        return { success: false, message: 'Too many failed attempts. Profile is locked.' };
      }
      return { success: false, message: `Incorrect PIN. ${remaining} attempts remaining.` };
    }
  }

  addToWishlist(product: Product) {
    const profile = this.activeProfile();
    const user = this.loggedInUser();
    if (profile?.type === 'child' && user) {
        const child = user.children.find(c => c.id === profile.id);
        if (child && !child.wishlist.some(item => item.id === product.id)) {
            child.wishlist.push(product);
            this.loggedInUser.set({ ...user }); // Trigger signal update
            this.activeProfile.update(p => p ? ({ ...p, wishlist: [...child.wishlist] }) as ActiveProfile : null);
        }
    }
  }

  redeemGiftCard(code: string): { success: boolean, message: string, amount?: number } {
    if (code.replace(/-/g, '').toUpperCase() === 'MIRA1234MIRA5678') {
      const profile = this.activeProfile();
      const user = this.loggedInUser();
      if (profile?.type === 'child' && user) {
        const amount = 50;
        const child = user.children.find(c => c.id === profile.id);
        if(child) {
            child.tokenBalance += amount;
            this.loggedInUser.set({ ...user }); // Trigger update
            this.activeProfile.update(p => p ? ({ ...p, tokenBalance: child.tokenBalance }) as ActiveProfile : null);
            return { success: true, message: `Yay! ${amount} Discovery Tokens have been added to your account.`, amount };
        }
      }
       return { success: false, message: 'You must be logged in as a child to redeem a gift card.' };
    }
    return { success: false, message: 'Hmm, that code didn\'t work. Please check it and try again!' };
  }
}
import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ShopComponent } from './components/shop/shop.component';
import { StoriesComponent } from './components/stories/stories.component';
import { ChatComponent } from './components/chat/chat.component';
import { AboutComponent } from './components/about/about.component';
import { ResourcesComponent } from './components/community/community.component';
import { HelpComponent } from './components/help/help.component';
import { ContactComponent } from './components/contact/contact.component';
import { PrivacySafetyComponent } from './components/privacy-safety/privacy-safety.component';
import { TermsComponent } from './components/terms/terms.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileSelectionComponent } from './components/profile-selection/profile-selection.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { RedeemComponent } from './components/redeem/redeem.component';
import { PinLoginComponent } from './components/pin-login/pin-login.component';
import { CommunityPageComponent } from './components/community-page/community-page.component';
import { GameComponent } from './components/game/game.component';
import { UserService, ChildProfile, ActiveProfile, View } from './services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ShopComponent, StoriesComponent, ChatComponent, AboutComponent, ResourcesComponent, HelpComponent, ContactComponent, PrivacySafetyComponent, TermsComponent, LoginComponent, RegisterComponent, ProfileSelectionComponent, DashboardComponent, WishlistComponent, RedeemComponent, PinLoginComponent, CommunityPageComponent, GameComponent],
})
export class AppComponent {
  private userService = inject(UserService);

  activeView = this.userService.activeView;
  mobileMenuOpen = signal<boolean>(false);
  mobileShopSubMenuOpen = signal<boolean>(false);

  newsletterEmail = signal('');
  newsletterSuccess = signal(false);
  newsletterError = signal<string | null>(null);

  loggedInUser = this.userService.loggedInUser;
  activeProfile = this.userService.activeProfile;

  activeChildProfile = computed<ChildProfile | null>(() => {
    const profile = this.activeProfile();
    return profile?.type === 'child' ? profile as ChildProfile : null;
  });

  setView(view: View) {
    this.userService.setView(view);
    this.mobileMenuOpen.set(false);
    this.mobileShopSubMenuOpen.set(false);
  }

  setShopView(category: string) {
    this.userService.setView('shop');
    this.mobileMenuOpen.set(false);
    this.mobileShopSubMenuOpen.set(false);
    console.log(`Navigating to shop category: ${category}`);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleMobileShopSubMenu() {
    this.mobileShopSubMenuOpen.update(v => !v);
  }

  onLoginSuccess() {
    this.setView('profileSelection');
  }

  onProfileSelected(profile: ActiveProfile) {
    if (profile.type === 'parent') {
      this.userService.setActiveProfile(profile);
      this.setView('dashboard');
    } else {
      this.userService.setProfileForPinLogin(profile as ChildProfile & { type: 'child' });
      this.setView('pinLogin');
    }
  }

  onPinLoginSuccess() {
    this.setView('home');
  }

  onBackToProfiles() {
    this.userService.clearProfileForPinLogin();
    this.setView('profileSelection');
  }

  logout() {
    this.userService.logout();
    this.setView('home');
  }

  switchProfile() {
    this.userService.clearActiveProfile();
    this.setView('profileSelection');
  }

  subscribeNewsletter() {
    this.newsletterSuccess.set(false);
    this.newsletterError.set(null);

    if (!this.newsletterEmail() || !this.newsletterEmail().includes('@')) {
      this.newsletterError.set('Oops! Please enter a valid email address.');
      return;
    }

    console.log(`Subscribing ${this.newsletterEmail()} to the newsletter.`);
    setTimeout(() => {
      this.newsletterSuccess.set(true);
      this.newsletterEmail.set('');
      setTimeout(() => this.newsletterSuccess.set(false), 5000);
    }, 1000);
  }
}
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, ChildProfile } from '../../services/user.service';
import { Product } from '../shop/shop.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistComponent {
  public userService = inject(UserService);
  activeProfile = computed(() => {
     const profile = this.userService.activeProfile();
     return profile?.type === 'child' ? profile as ChildProfile : null;
  });

  wishlist = computed<Product[]>(() => {
    return this.activeProfile()?.wishlist || [];
  });

  askParent(item: Product) {
    // In a real app, this might send a notification to the parent.
    // For now, it shows a confirmation alert.
    alert(`Your parent has been reminded that you'd really like the ${item.name}! They can see it in their dashboard.`);
  }
}

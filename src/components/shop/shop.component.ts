import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  tokenPrice: number;
  imageUrl: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopComponent {
  private userService = inject(UserService);
  activeProfile = this.userService.activeProfile;

  searchTerm = signal('');

  products = signal<Product[]>([
    {
      id: 1,
      name: 'Beirut Summer Dress',
      description: 'A light, airy dress with traditional Lebanese embroidery. Perfect for a sunny day!',
      price: 45.00,
      tokenPrice: 45,
      imageUrl: 'assets/mira/mira-yay.jpg',
    },
    {
      id: 2,
      name: 'Tita\'s Kitchen Playset',
      description: 'Learn to cook like my Tita! Includes wooden play food like tabbouleh and hummus.',
      price: 60.00,
      tokenPrice: 60,
      imageUrl: 'assets/mira/kitchen-tools.jpg',
    },
    {
      id: 3,
      name: 'Mira\'s Story Book',
      description: 'A collection of my adventures in Paris and Beirut. Written in English and French!',
      price: 18.50,
      tokenPrice: 18,
      imageUrl: 'assets/mira/kitchen-with-tita.jpg',
    },
    {
      id: 4,
      name: 'Handmade Cedar Toy',
      description: 'A beautiful toy car, handmade by artisans in Beirut from real Lebanese cedar wood.',
      price: 35.00,
      tokenPrice: 35,
      imageUrl: 'assets/mira/mira-crown.jpg',
    },
    {
      id: 5,
      name: 'Parisian Beret',
      description: 'A classic, soft wool beret, just like the one I wear when I walk by the Seine.',
      price: 22.00,
      tokenPrice: 22,
      imageUrl: 'assets/mira/mira-pattern.jpg',
    },
    {
      id: 6,
      name: '"Yalla!" T-Shirt',
      description: 'A fun and comfy t-shirt with "Yalla!" (Let\'s go!) written in colorful Arabic script.',
      price: 25.00,
      tokenPrice: 25,
      imageUrl: 'assets/mira/mira-trophy.jpg',
    },
  ]);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.products();
    }
    return this.products().filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });
  
  askParent(product: Product) {
    this.userService.addToWishlist(product);
    // In a real app, this would show a more elegant toast notification
    alert(`Your request for '${product.name}' has been sent to your parent! They can see it on their dashboard to approve.`);
  }
}
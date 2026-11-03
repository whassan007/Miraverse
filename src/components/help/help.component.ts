import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  articles: Article[];
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpComponent {
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);

  private allArticles: Article[] = [
      { id: 1, category: 'orders', title: 'How to track my order?', content: 'Once your order ships, you will receive an email with a tracking number and a link to the carrier\'s website.' },
      { id: 2, category: 'orders', title: 'Shipping Methods & Costs', content: 'We offer standard and expedited shipping. Costs are calculated at checkout based on your location.' },
      { id: 3, category: 'returns', title: 'What is your return policy?', content: 'We accept returns within 30 days of delivery for most items. Items must be unworn, unwashed, and have all original tags attached.' },
      { id: 4, category: 'returns', title: 'How to start a return?', content: 'Log into your account, go to "My Orders", find the order you want to return, and click "Start Return".' },
      { id: 5, category: 'products', title: 'Where can I find sizing guides?', content: 'Each clothing product page has a "Size Guide" link with detailed measurements.' },
      { id: 6, category: 'account', title: 'How do I reset my password?', content: 'Click "Forgot Password" on the login page and follow the instructions sent to your email.' },
      { id: 7, category: 'payment', title: 'What payment methods are accepted?', content: 'We accept all major credit cards, PayPal, and MiraVerse gift cards.' },
      { id: 8, category: 'chat', title: 'Is it safe for kids to chat with Mira?', content: 'Yes! Mira is powered by a safety-focused AI. All conversations are monitored for appropriateness and we have strong content filters.' },
      { id: 9, category: 'community', title: 'How do I join the Discord server?', content: 'You can join our Discord server via the link on the Community page. Please note you must be 13 or older to join.' },
      { id: 10, category: 'privacy', title: 'How do you protect my child\'s privacy?', content: 'We are fully COPPA compliant. We do not collect unnecessary personal information from children. Read our full Privacy & Safety policy for details.' },
  ];

  categories = signal<Category[]>([
    { id: 'orders', name: 'Orders & Shipping', icon: '📦', articles: this.allArticles.filter(a => a.category === 'orders') },
    { id: 'returns', name: 'Returns & Refunds', icon: '↩️', articles: this.allArticles.filter(a => a.category === 'returns') },
    { id: 'products', name: 'Products', icon: '🛍️', articles: this.allArticles.filter(a => a.category === 'products') },
    { id: 'account', name: 'Account & Orders', icon: '👤', articles: this.allArticles.filter(a => a.category === 'account') },
    { id: 'payment', name: 'Payment & Billing', icon: '💳', articles: this.allArticles.filter(a => a.category === 'payment') },
    { id: 'chat', name: 'Chat & Mira AI', icon: '💬', articles: this.allArticles.filter(a => a.category === 'chat') },
    { id: 'community', name: 'Community', icon: '🌐', articles: this.allArticles.filter(a => a.category === 'community') },
    { id: 'privacy', name: 'Privacy & Safety', icon: '🛡️', articles: this.allArticles.filter(a => a.category === 'privacy') },
  ]);

  selectedCategoryName = computed(() => {
    const categoryId = this.selectedCategory();
    if (!categoryId) {
      return null;
    }
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.name : null;
  });

  filteredArticles = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const categoryId = this.selectedCategory();

    if (!term && !categoryId) {
      return this.allArticles.slice(0, 5); // Return popular articles by default
    }

    let articles = this.allArticles;

    if (categoryId) {
        articles = this.categories().find(c => c.id === categoryId)?.articles || [];
    }
    
    if (term) {
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(term) || 
            article.content.toLowerCase().includes(term)
        );
    }
    
    return articles;
  });

  selectCategory(categoryId: string | null) {
    this.selectedCategory.set(categoryId);
    this.searchTerm.set(''); // Clear search when category changes
  }
}
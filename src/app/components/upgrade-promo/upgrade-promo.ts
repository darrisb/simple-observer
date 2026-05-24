import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface ProFeature {
  title: string;
  description: string;
}

interface PromoCta {
  label: string;
  url: string;
  external?: boolean;
}

interface PromoContentResponse {
  eyebrow?: string;
  heading?: string;
  subhead?: string;
  cards?: ProFeature[];
  features?: ProFeature[];
  primaryCta?: PromoCta;
  secondaryCta?: PromoCta;
  data?: {
    eyebrow?: string;
    heading?: string;
    subhead?: string;
    cards?: ProFeature[];
    features?: ProFeature[];
    primaryCta?: PromoCta;
    secondaryCta?: PromoCta;
  };
}

@Component({
  selector: 'app-upgrade-promo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './upgrade-promo.html',
  styleUrl: './upgrade-promo.scss',
})
export class UpgradePromo implements OnInit {
  private readonly apiService = inject(ApiService);
  isLoading = true;
  hasLoadError = false;
  cdr = inject(ChangeDetectorRef);

  eyebrow = '';
  heading = '';
  subhead = 'M';

  readonly fallbackFeatures: ProFeature[] = [];

  features: ProFeature[] = [];
  primaryCta: PromoCta = {
    label: 'View Pro Pricing',
    url: 'https://example.com/pricing',
    external: true,
  };
  secondaryCta: PromoCta = {
    label: 'Back to Dashboard',
    url: '',
    external: false,
  };

  ngOnInit(): void {
    this.loadPromoContent();
  }

  isExternal(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  private loadPromoContent(): void {
    this.isLoading = true;
    this.hasLoadError = false;

    this.apiService.get<PromoContentResponse>(
      'api/pro/content/upgrade-promo'
    ).subscribe({
      next: (response) => {
        const payload = response?.data ?? response;
        const nextEyebrow =
          typeof payload?.eyebrow === 'string' && payload.eyebrow.trim()
            ? payload.eyebrow.trim()
            : this.eyebrow;
        const nextHeading =
          typeof payload?.heading === 'string' && payload.heading.trim()
            ? payload.heading.trim()
            : this.heading;
        const nextSubhead =
          typeof payload?.subhead === 'string' && payload.subhead.trim()
            ? payload.subhead.trim()
            : this.subhead;

        const incomingCards = Array.isArray(payload?.cards)
          ? payload.cards
          : Array.isArray(payload?.features)
            ? payload.features
            : [];

        const cards = incomingCards
          .filter((item) => item && typeof item.title === 'string' && typeof item.description === 'string')
          .map((item) => ({
            title: item.title.trim(),
            description: item.description.trim(),
          }))
          .filter((item) => item.title.length > 0 && item.description.length > 0);

        const primary = this.normalizeCta(payload?.primaryCta);
        const secondary = this.normalizeCta(payload?.secondaryCta);
        const nextPrimary = primary ?? this.primaryCta;
        const nextSecondary = secondary ?? this.secondaryCta;

        console.log(nextSecondary);


        // Apply all view data in one pass, then release loading state.
        this.eyebrow = nextEyebrow;
        this.heading = nextHeading;
        this.subhead = nextSubhead;
        this.features = cards;
        this.primaryCta = nextPrimary;
        this.secondaryCta = nextSecondary;
        this.isLoading = false;
        console.log(this);

        this.cdr.detectChanges();
      },
      error: () => {
        this.features = [...this.fallbackFeatures];
        this.hasLoadError = true;
        this.isLoading = false;
      },
    });
  }

  private normalizeCta(raw: unknown): PromoCta | null {
    console.log('raw',raw);

    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const value = raw as Partial<PromoCta>;
    const label = String(value.label ?? '').trim();
    const url = String(value.url ?? '').trim();
    if (!label || !url) {
      return null;
    }

    return {
      label,
      url,
      external: Boolean(value.external),
    };
  }
}

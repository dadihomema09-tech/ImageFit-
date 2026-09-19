import { APP_CONFIG } from '../config/appConfig';

export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface AnalyticsProvider {
  name: string;
  init: () => void;
  trackEvent: (event: AnalyticsEvent) => void;
}

class AnalyticsManager {
  private enabled: boolean;
  private provider: AnalyticsProvider | null = null;

  constructor() {
    this.enabled = APP_CONFIG.analyticsEnabled;
  }

  public setProvider(provider: AnalyticsProvider): void {
    this.provider = provider;
    if (this.enabled && this.provider) {
      this.provider.init();
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.enabled && this.provider) {
      this.provider.init();
    }
  }

  public trackEvent(eventName: string, parameters?: Record<string, string | number | boolean>): void {
    if (!this.enabled || !this.provider) {
      // Privacy-first: strictly no-op when disabled
      return;
    }
    try {
      this.provider.trackEvent({ eventName, parameters });
    } catch {
      // Silently prevent any analytics failure from interrupting user workflows
    }
  }
}

export const analytics = new AnalyticsManager();

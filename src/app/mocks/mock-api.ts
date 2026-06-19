type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface MockErrorLog {
  _id: string;
  message: string;
  file: string;
  time: string;
  ai_explanation?: string;
}

interface MockNetworkLog {
  _id: string;
  direction: 'inbound' | 'outbound';
  url: string;
  method: string;
  status_code: string;
  ip_address: string;
  memory_usage: string;
  time: string;
}

function buildIsoDate(daysAgo: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
}

const MOCK_API_KEY = 'mock_api_key_12345';

const mockErrorLogs: MockErrorLog[] = [
  {
    _id: 'err_1001',
    message: 'Undefined index: cart_total',
    file: '/wp-content/plugins/checkout/includes/cart.php:114',
    time: buildIsoDate(0, 9),
  },
  {
    _id: 'err_1002',
    message: 'Undefined index: cart_total',
    file: '/wp-content/plugins/checkout/includes/cart.php:114',
    time: buildIsoDate(0, 14),
  },
  {
    _id: 'err_1003',
    message: 'Call to undefined function wc_get_product_id_by_sku()',
    file: '/wp-content/themes/custom/functions.php:283',
    time: buildIsoDate(1, 11),
    ai_explanation:
      'WooCommerce helper not loaded in this execution path. Load WooCommerce earlier or guard with function_exists before use.',
  },
  {
    _id: 'err_1004',
    message: 'Cannot modify header information - headers already sent',
    file: '/wp-includes/pluggable.php:1427',
    time: buildIsoDate(2, 16),
  },
];

const mockNetworkLogs: MockNetworkLog[] = [
  {
    _id: 'net_2001',
    direction: 'inbound',
    url: '/wp-json/wc/store/cart',
    method: 'GET',
    status_code: '200',
    ip_address: '172.31.8.44',
    memory_usage: '18 MB',
    time: buildIsoDate(0, 10),
  },
  {
    _id: 'net_2002',
    direction: 'outbound',
    url: 'https://api.stripe.com/v1/payment_intents',
    method: 'POST',
    status_code: '201',
    ip_address: '3.18.12.63',
    memory_usage: '22 MB',
    time: buildIsoDate(0, 13),
  },
  {
    _id: 'net_2003',
    direction: 'inbound',
    url: '/wp-login.php',
    method: 'POST',
    status_code: '403',
    ip_address: '84.19.117.91',
    memory_usage: '17 MB',
    time: buildIsoDate(1, 2),
  },
  {
    _id: 'net_2004',
    direction: 'outbound',
    url: 'https://woo-rag-api.myobserver.io/v1/pro/verify-key',
    method: 'POST',
    status_code: '200',
    ip_address: '44.219.182.11',
    memory_usage: '20 MB',
    time: buildIsoDate(1, 9),
  },
];

function extractFormAction(body: unknown): string | null {
  if (!(body instanceof FormData)) {
    return null;
  }

  const action = body.get('action');
  return typeof action === 'string' ? action : null;
}

function extractFormValue(body: unknown, key: string): string | null {
  if (!(body instanceof FormData)) {
    return null;
  }

  const value = body.get(key);
  return typeof value === 'string' ? value : null;
}

export function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();

  try {
    const parsed = new URL(trimmed);
    return parsed.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  } catch {
    return trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
  }
}

export function getMockResponse(method: HttpMethod, endpoint: string, body?: unknown): unknown {
  if (method === 'GET' && endpoint === 'api/dashboard/query') {
    return { errors: [...mockErrorLogs] };
  }

  if (method === 'GET' && endpoint.startsWith('api/dashboard/explain/')) {
    const id = endpoint.split('/').pop() ?? '';
    const target = mockErrorLogs.find((item) => item._id === id);

    return {
      explanation:
        target?.ai_explanation ??
        'Check stack trace context, validate input existence, and add null/undefined guards around this execution path.',
    };
  }

  if (method === 'GET' && endpoint === 'api/dashboard/upgrade') {
    return { url: 'https://example.com/mock-upgrade' };
  }

  if (method === 'GET' && endpoint === 'api/pro/availability') {
    return { available: false };
  }

  if (method === 'GET' && endpoint === 'api/pro/features') {
    return {
      features: [
        {
          title: 'Longer History',
          description: 'Keep logs for 30+ days and investigate recurring issues over time.',
        },
        {
          title: 'AI Fix Insights',
          description: 'Get prioritized explanations and recommended next actions for critical errors.',
        },
        {
          title: 'Network Observability',
          description: 'Track inbound and outbound request behavior to isolate traffic anomalies.',
        },
        {
          title: 'Priority Processing',
          description: 'Faster analysis pipelines for high-volume sites and support workflows.',
        },
      ],
    };
  }

  if (method === 'GET' && endpoint === 'api/pro/calendar-banner') {
    return {
      available: false,
      imageSrc: ''
    };
  }

  if (method === 'GET' && endpoint === 'api/pro/content/upgrade-promo') {
    return {
      eyebrow: 'AI Observer Pro',
      heading: 'Upgrade to Pro',
      subhead: 'Unlock advanced monitoring and faster remediation for your team.',
      cards: [
        {
          title: 'Longer History',
          description: 'Keep log history for deeper trend investigation and recurring issue analysis.',
        },
        {
          title: 'AI Fix Insights',
          description: 'Get actionable suggestions and context-aware triage guidance for critical issues.',
        },
        {
          title: 'Network Observability',
          description: 'Correlate inbound and outbound network events with error spikes.',
        },
      ],
      primaryCta: {
        label: 'View Pro Pricing',
        url: 'https://example.com/pricing',
        external: true,
      },
      secondaryCta: {
        label: 'Back to Dashboard',
        url: '/dashboard',
        external: false,
      },
    };
  }

  if (method === 'GET' && endpoint === 'wp-json/error-logs/v1/logs') {
    return [...mockErrorLogs];
  }

  if (method === 'POST' && endpoint === 'api/registration') {
    return {
      customer_token: 'mock_customer_token',
      api_key: MOCK_API_KEY,
    };
  }

  if (method === 'POST' && endpoint.endsWith('admin-ajax.php')) {
    const action = extractFormAction(body);
    const logType = extractFormValue(body, 'log_type');

    if (action === 'ai_get_api_key') {
      return { data: { api_key: MOCK_API_KEY } };
    }

    if (action === 'save_token') {
      return { success: true };
    }

    // WordPress dashboard log fetch mode.
    if (logType === 'errors') {
      return {
        success: true,
        data: {
          errors: [...mockErrorLogs]
        }
      };
    }

    if (logType === 'network') {
      return {
        success: true,
        data: {
          network: [...mockNetworkLogs],
        }
      };
    }

    if (logType === 'all') {
      return {
        success: true,
        data: {
          errors: [...mockErrorLogs],
          network: [...mockNetworkLogs],
        }
      };
    }
  }

  return undefined;
}

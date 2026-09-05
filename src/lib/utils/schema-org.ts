interface ProductInput {
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  attributes: Record<string, string>;
  merchantName: string;
}

export function generateProductJsonLd(product: ProductInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    brand: {
      '@type': 'Organization',
      name: product.merchantName,
    },
    additionalProperty: Object.entries(product.attributes).map(
      ([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value,
      })
    ),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.merchantName,
      },
    },
  };
}

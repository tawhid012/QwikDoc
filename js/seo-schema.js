/**
 * QwikDoc SEO & AI Schema Generator
 * Provides structured data for Google and AI Search Engines.
 */

const SEOSchema = {
  baseUrl: 'https://qwikdoc.in',
  organizationName: 'QwikDoc',
  logoUrl: 'https://qwikdoc.in/logo/primary.png',

  getOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": this.organizationName,
      "url": this.baseUrl,
      "logo": this.logoUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-1234567890",
        "contactType": "customer service"
      }
    };
  },

  getWebsiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": this.organizationName,
      "url": this.baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${this.baseUrl}/search.html?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  },

  getMedicalBusinessSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": this.organizationName,
      "url": this.baseUrl,
      "description": "Premium healthcare platform to find and book appointments with verified doctors and clinicians.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "GHY",
        "addressRegion": "AS",
        "addressCountry": "IN"
      }
    };
  },

  inject(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
};

// Auto-inject common schemas
window.addEventListener('load', () => {
  SEOSchema.inject(SEOSchema.getOrganizationSchema());
  SEOSchema.inject(SEOSchema.getWebsiteSchema());
});

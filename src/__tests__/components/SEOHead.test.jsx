/**
 * Tests for SEOHead Component
 * SEO meta tags management
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Helmet } from 'react-helmet';
import SEOHead from '../../components/SEOHead';

describe('SEOHead Component', () => {
  describe('basic meta tags', () => {
    it('should set the title', async () => {
      render(
        <SEOHead 
          title="Test Page Title" 
          description="Test description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        expect(helmet.title).toBe('Test Page Title');
      });
    });

    it('should set the description', async () => {
      render(
        <SEOHead 
          title="Test" 
          description="This is a test description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const descMeta = helmet.metaTags.find(tag => tag.name === 'description');
        expect(descMeta.content).toBe('This is a test description');
      });
    });

    it('should set keywords when provided', async () => {
      render(
        <SEOHead 
          title="Test" 
          description="Description"
          keywords="finance, personal finance, budget"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const keywordsMeta = helmet.metaTags.find(tag => tag.name === 'keywords');
        expect(keywordsMeta.content).toBe('finance, personal finance, budget');
      });
    });

    it('should set canonical URL when provided', async () => {
      render(
        <SEOHead 
          title="Test" 
          description="Description"
          canonical="/test-page"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const canonical = helmet.linkTags.find(tag => tag.rel === 'canonical');
        expect(canonical.href).toBe('https://pacifinance.com/en/test-page');
      });
    });
  });

  describe('robots meta', () => {
    it('should index by default', async () => {
      render(
        <SEOHead 
          title="Test" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const robotsMeta = helmet.metaTags.find(tag => tag.name === 'robots');
        expect(robotsMeta.content).toBe('index, follow');
      });
    });

    it('should noindex when specified', async () => {
      render(
        <SEOHead 
          title="Test" 
          description="Description"
          noindex={true}
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const robotsMeta = helmet.metaTags.find(tag => tag.name === 'robots');
        expect(robotsMeta.content).toBe('noindex, nofollow');
      });
    });
  });

  describe('Open Graph tags', () => {
    it('should set og:title from title by default', async () => {
      render(
        <SEOHead 
          title="Page Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const ogTitle = helmet.metaTags.find(tag => tag.property === 'og:title');
        expect(ogTitle.content).toBe('Page Title');
      });
    });

    it('should set custom og:title when provided', async () => {
      render(
        <SEOHead 
          title="Page Title" 
          description="Description"
          ogTitle="Custom OG Title"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const ogTitle = helmet.metaTags.find(tag => tag.property === 'og:title');
        expect(ogTitle.content).toBe('Custom OG Title');
      });
    });

    it('should set og:description from description by default', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Page Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const ogDesc = helmet.metaTags.find(tag => tag.property === 'og:description');
        expect(ogDesc.content).toBe('Page Description');
      });
    });

    it('should set og:type as website', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const ogType = helmet.metaTags.find(tag => tag.property === 'og:type');
        expect(ogType.content).toBe('website');
      });
    });

    it('should set og:site_name as PaciFinance', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const ogSiteName = helmet.metaTags.find(tag => tag.property === 'og:site_name');
        expect(ogSiteName.content).toBe('PaciFinance');
      });
    });
  });

  describe('Twitter Card tags', () => {
    it('should default to summary_large_image', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const twitterCard = helmet.metaTags.find(tag => tag.name === 'twitter:card');
        expect(twitterCard.content).toBe('summary_large_image');
      });
    });

    it('should set custom twitter:card when provided', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
          twitterCard="summary"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const twitterCard = helmet.metaTags.find(tag => tag.name === 'twitter:card');
        expect(twitterCard.content).toBe('summary');
      });
    });
  });

  describe('additional meta tags', () => {
    it('should set author as PaciFinance', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const author = helmet.metaTags.find(tag => tag.name === 'author');
        expect(author.content).toBe('PaciFinance');
      });
    });

    it('should set viewport meta tag', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const viewport = helmet.metaTags.find(tag => tag.name === 'viewport');
        expect(viewport.content).toContain('width=device-width');
      });
    });
  });

  describe('structured data', () => {
    it('should include schema.org JSON-LD', async () => {
      render(
        <SEOHead 
          title="Title" 
          description="Test Description"
        />
      );
      
      await waitFor(() => {
        const helmet = Helmet.peek();
        const script = helmet.scriptTags.find(tag => tag.type === 'application/ld+json');
        expect(script).toBeDefined();
        
        const jsonContent = JSON.parse(script.innerHTML);
        expect(jsonContent['@context']).toBe('https://schema.org');
        expect(jsonContent['@type']).toBe('WebApplication');
        expect(jsonContent.name).toBe('PaciFinance');
        expect(jsonContent.description).toBe('Test Description');
        expect(jsonContent.applicationCategory).toBe('FinanceApplication');
      });
    });
  });
});

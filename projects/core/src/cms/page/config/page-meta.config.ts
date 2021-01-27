import { Injectable } from '@angular/core';
import { Config } from '../../../config/config-tokens';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class PageMetaConfig {
  pageMeta?: PageMetaResolversConfig;
}

export interface PageMetaResolversConfig {
  resolvers?: PageMetaResolverConfig[];

  options?: {
    canonicalUrl?: CanonicalUrlOptions;
  };

  /**
   * Enables resolvers in dev mode regardless of the CSR configuration. This
   * flag will override the disabling in CSR, which can be useful during development
   * and debugging.
   */
  enableInDevMode?: boolean;
}

export interface PageMetaResolverConfig {
  /**
   * PageMeta property
   */
  property: string;

  /**
   * The resolver method that must be provided on the resolver class.
   */
  method: string;

  /**
   * Disables specific resolvers in CSR mode. Some of the resolvers are
   * not needed in CSR app, as they're only used for crawlers who will
   * be served from SSR rendered pages.
   */
  disabledInCsr?: boolean;
}

export interface CanonicalUrlOptions {
  /**
   * Forces a trailing slash to avoid both https://www.myshop.com and https://www.myshop.com/.
   */
  forceTrailingSlash?: boolean;

  /**
   * Forces the use of `https://` in the canonical URL.
   */
  forceHttps?: boolean;

  /**
   * Forces the `www` subdomain, do that canonical URLs are always prefixed.
   */
  forceWww?: boolean;

  /**
   * Removes query parameters from the URL to avoid page duplicates.
   */
  removeQueryParams?: boolean | string[];
}

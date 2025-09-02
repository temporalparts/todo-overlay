/**
 * Domain matching utilities for TABULA
 * Supports rich matching patterns including subdomains and paths
 */

/**
 * Normalizes a URL pattern for storage and comparison
 * Removes http/https protocols, www prefix, and trailing slashes
 */
export function normalizeDomainPattern(pattern: string): string {
  // Remove http:// or https:// protocols if present
  let cleaned = pattern
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www prefix
    .toLowerCase()
    .trim();
  
  // Remove trailing slash only if it's just a domain (no path after)
  if (cleaned.endsWith('/') && cleaned.indexOf('/') === cleaned.length - 1) {
    cleaned = cleaned.slice(0, -1);
  }
  
  return cleaned;
}

/**
 * List of common compound/public TLDs that should be treated as a single unit
 * This is not exhaustive but covers the most common cases
 */
const COMPOUND_TLDS = [
  '.co.uk', '.co.jp', '.co.kr', '.co.nz', '.co.za', '.co.in',
  '.com.au', '.com.br', '.com.cn', '.com.mx', '.com.tw', '.com.sg',
  '.net.au', '.net.br', '.net.cn', '.net.mx', '.net.tw',
  '.org.uk', '.org.au', '.org.br', '.org.cn', '.org.mx',
  '.gov.uk', '.gov.au', '.gov.br', '.gov.cn', '.gov.in',
  '.ac.uk', '.ac.jp', '.ac.kr', '.ac.nz', '.ac.za',
  '.edu.au', '.edu.br', '.edu.cn', '.edu.mx', '.edu.sg'
];

/**
 * Determines if a domain is a root domain or a subdomain
 * Handles compound TLDs like .co.uk properly
 */
function isRootDomain(domain: string): boolean {
  // Check for compound TLDs
  for (const tld of COMPOUND_TLDS) {
    if (domain.endsWith(tld)) {
      // Remove the compound TLD and check what's left
      const withoutTld = domain.slice(0, -tld.length);
      // If what's left has no dots, it's a root domain
      return !withoutTld.includes('.');
    }
  }
  
  // For simple TLDs, check if it has exactly 2 parts
  const parts = domain.split('.');
  return parts.length === 2;
}

/**
 * Checks if a URL matches a domain pattern
 * Supports:
 * - example.com (matches example.com and all subdomains like mail.example.com)
 * - example.co.uk (properly handles compound TLDs)
 * - sub.example.com (matches only this exact subdomain, not sub.sub.example.com)
 * - example.com/path (matches this domain/subdomains with paths starting with /path)
 * - sub.example.com/path (matches this exact subdomain with specific path prefix)
 */
export function matchesPattern(url: string, pattern: string): boolean {
  try {
    const u = new URL(url);
    const urlHost = u.hostname.replace(/^www\./, '').toLowerCase();
    // URL constructor automatically decodes the pathname
    // e.g., "/path%20with%20spaces" becomes "/path with spaces"
    const urlPath = decodeURIComponent(u.pathname).toLowerCase();
    
    // Parse the pattern
    const [patternDomain, ...patternPathParts] = pattern.split('/');
    const patternPath = patternPathParts.length > 0 ? '/' + patternPathParts.join('/') : '';
    
    // Check domain matching
    let domainMatches = false;
    
    if (patternDomain === urlHost) {
      // Exact domain match
      domainMatches = true;
    } else if (isRootDomain(patternDomain)) {
      // Root domain pattern (e.g., "example.com" or "example.co.uk")
      // Matches all subdomains
      domainMatches = urlHost === patternDomain || urlHost.endsWith('.' + patternDomain);
    } else {
      // Specific subdomain pattern (e.g., "mail.google.com")
      // Must match exactly - doesn't match deeper subdomains
      domainMatches = urlHost === patternDomain;
    }
    
    if (!domainMatches) {
      return false;
    }
    
    // Check path matching (if pattern includes a path)
    if (patternPath) {
      // Path must start with the pattern path
      return urlPath.startsWith(patternPath);
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL matches any pattern in the domain list
 */
export function isUrlInDomainList(url: string, patterns: string[]): boolean {
  // Normalize patterns for comparison
  const normalizedPatterns = patterns.map(p => normalizeDomainPattern(p));
  
  return normalizedPatterns.some(pattern => matchesPattern(url, pattern));
}

/**
 * Legacy function - kept for backward compatibility but now uses pattern matching
 */
export function getRootDomain(url: string): string {
  try {
    const u = new URL(url);
    const hostname = u.hostname;
    
    // Remove www. prefix
    const withoutWww = hostname.replace(/^www\./, '');
    
    // Simple approach: take last two parts for most domains
    // This handles most common cases like reddit.com, twitter.com
    const parts = withoutWww.split('.');
    if (parts.length <= 2) {
      return withoutWww;
    }
    
    // For subdomains, return last 2 parts (e.g., api.reddit.com -> reddit.com)
    return parts.slice(-2).join('.');
  } catch {
    return '';
  }
}

/**
 * Validates if a domain pattern is valid
 * Returns an error message if invalid, null if valid
 */
export function validateDomainPattern(pattern: string): string | null {
  // Check for non-http/https protocols (these are rejected)
  if (/^(?!https?:\/\/)[a-zA-Z]+:\/\//.test(pattern)) {
    return 'Only http:// and https:// protocols are supported (they will be automatically removed)';
  }
  
  // Check for empty pattern
  const normalized = normalizeDomainPattern(pattern);
  if (!normalized) {
    return 'Please enter a domain';
  }
  
  // Split into domain and path parts
  const [domain, ...pathParts] = normalized.split('/');
  
  // Check for at least one dot separator (unless it's localhost or an IP)
  if (!domain.includes('.') && !domain.startsWith('localhost')) {
    return 'Domain must have at least one dot (e.g., google.com, not just google)';
  }
  
  // Validate domain part (no wildcards allowed)
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)*[a-z0-9]+(-[a-z0-9]+)*(\.[a-z]{2,})?$/i;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const localhostRegex = /^localhost(:\d+)?$/i;
  
  if (!domainRegex.test(domain) && !ipRegex.test(domain) && !localhostRegex.test(domain)) {
    return 'Invalid domain format';
  }
  
  // Check domain length
  if (domain.length < 1 || domain.length > 253) {
    return 'Domain must be between 1 and 253 characters';
  }
  
  // Validate path part if present
  if (pathParts.length > 0) {
    const path = pathParts.join('/');
    // Basic path validation - no need to be too strict
    if (path.includes('..')) {
      return 'Path cannot contain ".."';
    }
  }
  
  return null; // Valid
}
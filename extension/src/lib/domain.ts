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

export function isUrlInDomainList(url: string, domains: string[]): boolean {
  const rootDomain = getRootDomain(url);
  return domains.includes(rootDomain);
}
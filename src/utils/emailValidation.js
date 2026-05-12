import isDisposableEmailLibrary from 'is-disposable-email';

const getEmailDomain = (email) => {
    if (!email) {
        return '';
    }

    const normalized = String(email).trim().toLowerCase();
    const atIndex = normalized.lastIndexOf('@');
    if (atIndex < 0 || atIndex === normalized.length - 1) {
        return '';
    }

    return normalized.slice(atIndex + 1);
};

export const ALLOWED_EMAIL_DOMAINS = [
    "gmail.com",
    "outlook.com",
    "yahoo.com",
    "hotmail.com"
];

export const allowedEmailDomainsMessage =
    "Email domain must be gmail.com, outlook.com, yahoo.com, or hotmail.com.";

export const isAllowedEmailDomain = (email) => {
    const domain = getEmailDomain(email);
    if (!domain) {
        return false;
    }

    return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

export const isDisposableEmail = (email) => {
    const normalized = String(email || '').trim().toLowerCase();
    const domain = getEmailDomain(normalized);
    if (!normalized || !domain) {
        return false;
    }

    try {
        return Boolean(isDisposableEmailLibrary(normalized));
    } catch {
        return false;
    }
};

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

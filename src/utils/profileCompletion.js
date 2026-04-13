export const isUserProfileComplete = (user) => {
    if (!user || typeof user !== 'object') return false;

    const name = String(user.name || '').trim();
    const email = String(user.email || '').trim();
    const phone = String(user.phone || '').replace(/\s+/g, '').trim();
    const location = String(user.location || '').trim();
    const interests = Array.isArray(user.interests)
        ? user.interests.filter((interest) => String(interest || '').trim().length > 0)
        : [];

    const hasRequiredFields = Boolean(name)
        && Boolean(email)
        && Boolean(phone)
        && Boolean(location)
        && interests.length > 0;

    return hasRequiredFields;
};

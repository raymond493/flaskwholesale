const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateRfq(input) {
    const errors = {};
    if (!input.name.trim()) {
        errors.name = "Enter your name.";
    }
    if (!emailPattern.test(input.email.trim())) {
        errors.email = "Enter a valid email address.";
    }
    if (!input.country.trim()) {
        errors.country = "Enter your country.";
    }
    return {
        ok: Object.keys(errors).length === 0,
        errors
    };
}

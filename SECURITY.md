# Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in the GiftForYou.idn application.

## Authentication & Authorization

### JWT Tokens
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
- **Automatic Refresh**: Tokens are automatically refreshed before expiry

### Password Security
- **Minimum Length**: 8 characters
- **Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Hashing**: bcrypt with cost factor 12
- **Validation**: Strong password validation on registration

### Account Lockout
- **Max Attempts**: 5 failed login attempts
- **Lockout Duration**: 15 minutes
- **Reset**: Lockout resets on successful login

## API Security

### Rate Limiting
- **Login Endpoint**: 5 requests per 15 minutes per IP
- **API Endpoints**: 100 requests per 15 minutes per IP
- **Implementation**: In-memory store (consider Redis for production)

### Protected Routes
All write operations (POST, PUT, DELETE) require:
1. Valid JWT token
2. Admin role (for admin operations)

Protected endpoints:
- `/api/bouquets` (POST, PUT, DELETE)
- `/api/collections` (POST, PUT, DELETE)
- `/api/orders` (GET, PATCH, DELETE)
- `/api/hero-slider` (PUT, POST)
- `/api/metrics` (GET)

### Input Validation & Sanitization
- All user inputs are sanitized
- XSS prevention (removes `<`, `>`, `javascript:`, event handlers)
- Email validation (RFC 5321 compliant)
- Username validation (alphanumeric, underscores, hyphens only)

## Security Headers

The following security headers are implemented:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Restricts browser features
- `Content-Security-Policy` - Restricts resource loading
- `Strict-Transport-Security` - HSTS (production only)

## CORS Configuration

- **Development**: Permissive (allows all origins)
- **Production**: Strict (only configured origins allowed)
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization

## Session Management

- **Timeout**: 30 minutes of inactivity
- **Activity Tracking**: Mouse, keyboard, scroll, touch events
- **Auto-logout**: Automatic logout on session timeout
- **Token Refresh**: Automatic token refresh before expiry

## Error Handling

- **Information Leakage**: Generic error messages (no stack traces in production)
- **Logging**: Detailed errors logged server-side only
- **User Messages**: User-friendly error messages without technical details

## Registration

- **Production**: Disabled by default
- **Enable**: Set `ALLOW_PUBLIC_REGISTRATION=true` in environment variables
- **Recommendation**: Keep disabled, create users via seed script or admin panel

## Environment Variables

### Required Variables
- `JWT_SECRET` - **CRITICAL**: Must be a strong, random secret (minimum 32 characters)
- `MONGO_URI` - MongoDB connection string
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)

### Optional Variables
- `ALLOW_PUBLIC_REGISTRATION` - Set to "true" to enable public registration
- `NODE_ENV` - Set to "production" for production mode

### Security Best Practices
1. **Never commit `.env` files** to version control
2. **Use strong JWT_SECRET**: Generate using `openssl rand -base64 32`
3. **Rotate secrets regularly**: Change JWT_SECRET periodically
4. **Use HTTPS**: Always use HTTPS in production
5. **Monitor logs**: Regularly review authentication logs

## Security Checklist

### Before Production Deployment
- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `CORS_ORIGIN` with production domain
- [ ] Set `NODE_ENV=production`
- [ ] Disable public registration (`ALLOW_PUBLIC_REGISTRATION` not set)
- [ ] Enable HTTPS
- [ ] Review and update security headers
- [ ] Set up rate limiting with Redis (for scalability)
- [ ] Implement request logging and monitoring
- [ ] Set up automated security scanning
- [ ] Review and update dependencies regularly

### Ongoing Security
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Monitor failed login attempts
- [ ] Review access logs
- [ ] Rotate secrets periodically
- [ ] Keep security headers updated

## Known Limitations

1. **Token Storage**: Currently using localStorage (vulnerable to XSS). Consider httpOnly cookies for production.
2. **Rate Limiting**: In-memory store (not distributed). Use Redis for multi-server deployments.
3. **Account Lockout**: Per-IP based (can be bypassed with IP rotation). Consider per-username lockout.
4. **Session Timeout**: Client-side only. Consider server-side session management.

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not create a public issue
2. Contact the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)


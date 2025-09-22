# Security Policy

## Supported Versions

We support the following versions of TheJERKTracker with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TheJERKTracker seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT open a public issue

Please **do not** report security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report privately

Instead, please send an email to: **security@paintbrush.team** with the following information:

- **Subject**: Security Vulnerability Report - TheJERKTracker
- **Description**: Detailed description of the vulnerability
- **Steps to Reproduce**: How to reproduce the issue
- **Impact**: What could an attacker accomplish?
- **Severity**: Your assessment of the severity (Critical/High/Medium/Low)
- **Your Contact Information**: So we can follow up with questions

### 3. What to expect

- **Acknowledgment**: We'll acknowledge receipt within 24 hours
- **Initial Response**: We'll provide an initial response within 72 hours
- **Progress Updates**: We'll keep you informed about our progress
- **Resolution**: We'll work with you to understand and resolve the issue

### 4. Responsible Disclosure

We ask that you:

- Give us reasonable time to investigate and fix the issue before public disclosure
- Avoid accessing or modifying data that doesn't belong to you
- Don't perform DoS attacks or spam
- Don't access, modify, or delete data belonging to other users

## Security Considerations

### Current Security Status

⚠️ **Please note**: The current version of TheJERKTracker is in development and has known security limitations:

- **No Authentication**: Admin dashboard is publicly accessible
- **No Authorization**: No role-based access control
- **Local Storage**: Data stored unencrypted in browser
- **No Input Validation**: Limited sanitization of user inputs
- **No Rate Limiting**: APIs not protected against abuse

### Planned Security Improvements

See our [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) for detailed security enhancements:

**Phase 1: Foundation & Security**
- Database integration with proper access controls
- Authentication system with NextAuth.js
- Input validation and sanitization
- CSRF protection and security headers

**Phase 2: Advanced Security**
- Role-based authorization
- API rate limiting
- Comprehensive audit logging
- Data encryption for sensitive information

## Security Best Practices

When contributing to TheJERKTracker, please follow these security practices:

### Code Security
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper error handling (don't expose sensitive info)
- Use HTTPS in production environments
- Keep dependencies updated

### Data Protection
- Don't store sensitive data in localStorage
- Implement proper session management
- Use strong encryption for sensitive data
- Follow data retention policies
- Implement secure password policies

### API Security
- Implement authentication for all API endpoints
- Use rate limiting to prevent abuse
- Validate request data and headers
- Implement proper CORS policies
- Use secure HTTP headers

## Known Vulnerabilities

### Current Issues (Development Phase)

1. **Open Admin Access**: Anyone can access `/admin` without authentication
   - **Severity**: Critical
   - **Mitigation**: Only use in development environments
   - **Fix**: Planned in Phase 1 (Authentication system)

2. **XSS Vulnerability**: User inputs not properly sanitized
   - **Severity**: High
   - **Mitigation**: Avoid entering malicious scripts
   - **Fix**: Planned in Phase 1 (Input validation)

3. **Data Exposure**: Customer data in localStorage is unencrypted
   - **Severity**: Medium
   - **Mitigation**: Clear browser data after use
   - **Fix**: Planned in Phase 1 (Database migration)

### Fixed Vulnerabilities

*None yet - this is the initial release*

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [TypeScript Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/TypeScript_Cheat_Sheet.html)

## Contact Information

For security-related inquiries:
- **Email**: security@paintbrush.team
- **Response Time**: Within 24 hours for acknowledgment
- **Escalation**: For critical issues, mark email as "URGENT"

For general support:
- **GitHub Issues**: For non-security bugs and features
- **GitHub Discussions**: For questions and community support

---

Thank you for helping to keep TheJERKTracker secure! 🔒
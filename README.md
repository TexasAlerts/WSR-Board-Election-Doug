# WSR Board Election site

## Custom domain

1. In the Vercel dashboard open **Project → Settings → Domains** and add `dougcharles.com`.
2. Update DNS:
   - **Vercel nameservers (recommended):** set your registrar to use the nameservers shown by Vercel.
   - **Keep existing DNS:** create records
        - `A` for `@` → `76.76.21.21`
        - `CNAME` for `www` → `cname.vercel-dns.com`
3. Wait for propagation and visit `https://www.dougcharles.com` to verify.

## Resend email

1. In the [Resend dashboard](https://resend.com) add the domain `dougcharles.com`.
2. Add the DKIM and SPF TXT records provided by Resend to your DNS host and wait for verification.
3. Set the following environment variables in Vercel (or a local `.env` file) before deploying:

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<your Resend API key>
SMTP_SECURE=false
NOTIFY_EMAIL=dbcharles@me.com
SMTP_FROM=no-reply@dougcharles.com
```

4. Redeploy and test any feature that calls `sendNotificationEmail`.

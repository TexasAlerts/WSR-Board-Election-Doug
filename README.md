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
2. Add the DKIM and SPF TXT records provided by Resend to your DNS host and wait for verification. For `dougcharles.com`, Resend supplied these records:

   | Type | Name | Value | TTL | Notes |
   | ---- | ---- | ----- | --- | ----- |
   | MX   | send | feedback-smtp.us-east-1.amazonses.com | 60 | priority 10 |
   | TXT  | send | v=spf1 include:amazonses.com ~all | 60 | SPF |
   | TXT  | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTMgfUzxqEMhniJ3X2ot0uvaM3UdO2/y9wbm+4yu4W+51UO5f1j3lsqHSEgcAlY4HkbFuYHVctySNrsPytBv+vpJyr0hM88Ifnvffw8se/L0+G5JfdST6BLfCoS2GTlThna4BlRTb4lvzLNsm6uMNeZuF8ZS+urE/P6IhFuZGPCQIDAQAB | Auto | DKIM |
   | TXT  | _dmarc | v=DMARC1; p=none; | Auto | DMARC |

3. Set the following environment variables in Vercel (or a local `.env` file) before deploying:

```
RESEND_API_KEY=<your Resend API key>
NOTIFY_EMAIL=dbcharles@me.com
SMTP_FROM=no-reply@dougcharles.com
SUPABASE_URL=<your Supabase project URL>
SUPABASE_ANON_KEY=<public anon key>
SUPABASE_SERVICE_ROLE=<service role key>
SITE_URL=https://www.dougcharles.com
```

   The Vercel Resend integration automatically populates `RESEND_API_KEY`.

4. Redeploy and test any feature that calls `sendNotificationEmail`.
Preview test: Aug 11

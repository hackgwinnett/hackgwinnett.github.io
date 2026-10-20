# Newsletter

> Thanks, Claude!

Two separate Apps Script web apps, both bound to the same Google Sheet (subscriber list), each
scoped to one job:

- **Subscriptions** (`.vault/test.gs`) — public, no secret. Handles signup, email verification,
  and unsubscribe. Its URL is `PUBLIC_APPS_SCRIPT_NEWSLETTER_URL` (safe to ship in the build:
  the whole point of this deployment is that anyone can call it).
- **Sender** (`.vault/subscriptions.gs`) — secret-gated. Sends the newsletter to every verified
  subscriber. Its URL + secret are **never** shipped to production; they only live in your local
  `.env` and are used by the `/a/sender` page, which itself 404s outside `vp dev`.

Why two projects instead of one: least privilege. A public endpoint that can email your whole
list would be a much bigger blast radius if its secret ever leaked.

## One-time setup (per officer who needs to send)

### 1. Get the Sender script's `/exec` URL and secret

Ask whoever administers the Apps Script project (or set it up yourself, see below) for:

- the Sender deployment's `/exec` URL
- the `NEWSLETTER_SECRET` value

If you're setting it up for the first time:

1. Open the [Apps Script project](https://script.google.com) bound to the newsletter Sheet.
2. Paste the contents of `.vault/subscriptions.gs` into a script file (create one, e.g. `Sender.gs`,
   if it doesn't exist).
3. **Project Settings → Script Properties** → add `NEWSLETTER_SECRET` with a long random value
   (e.g. generate one with `openssl rand -hex 32`).
4. **Deploy → New deployment → Web app**. Execute as "Me", access "Anyone". Deploy, then copy
   the `/exec` URL it gives you.
5. Run `authorizeMailApp_` once from the Apps Script editor (Run button) and approve the
   permission prompts — this is what lets `MailApp.sendEmail` work at all.
6. In the **Sender** project's **Project Settings → Script Properties**, add `SUBSCRIPTIONS_URL`
   set to the **Subscriptions** project's `/exec` URL (used to build unsubscribe links) — the
   script errors loudly if it's missing or malformed. This lives in Script Properties, not a
   spreadsheet cell, so a Sheet edit can't silently go stale (see the `CONFIGURATION` comment
   block at the top of `subscriptions.gs`).

### 2. Configure your local `.env`

Copy `.env.example` to `.env` (git-ignored) and fill in:

```
PUBLIC_APPS_SCRIPT_SENDER_URL=<the /exec URL from step 1.4>
PUBLIC_NEWSLETTER_SENDER_SECRET=<the NEWSLETTER_SECRET value from step 1.3>
PUBLIC_NEWSLETTER_TEST_EMAIL=<your own email, for the "send test" button>
```

**Do not add these three to the `pages` GitHub environment**, unlike
`PUBLIC_APPS_SCRIPT_NEWSLETTER_URL` above. `PUBLIC_` is otherwise this repo's signal for "safe
to bake into the build" (see `docs/HOSTING.md`) — that's true for the subscribe URL, but the
sender secret must only ever live in your local `.env`. `build.ts`'s `EXPECTED_ENV` list only
checks for `PUBLIC_APPS_SCRIPT_NEWSLETTER_URL`, so nothing in the build pipeline reads these
three today, and `/a/sender` itself 404s outside `vp dev` — keep both of those true.

### 3. Send

`vp dev`, go to `/a/sender`. The Apps Script URL/secret/test-email fields pre-fill from your
`.env` (still editable if you're using a different deployment locally). The subscriber-count
tiles and the "send test to yourself" button both call the Sender script too, so you can sanity
check before the real send.

## Keeping the email template in sync

The email's HTML/text template used to be hand-duplicated in two places — a Tailwind mockup in
`/a/sender`'s preview, and the real inline-styled HTML in the Sender script's
`buildNewsletterHtml_` — and they'd quietly drifted apart. There's now exactly one copy:
`src/lib/newsletter/template.ts`, a plain, self-contained (zero-import) TS module. `/a/sender`
imports it directly and renders its real output in an `<iframe srcDoc>`, so the preview you see
is byte-for-byte what gets sent — not an approximation.

Apps Script has no bundler and can't run TypeScript or `import`/`export`, so that same file can't
be pasted into the Sender project as-is. Instead:

```
pnpm sync:newsletter-template
```

strips its types (via Node's built-in `stripTypeScriptTypes` — no extra dependency) and writes a
plain-JS copy to `.vault/GENERATED_Template.gs` (gitignored; it's a build artifact). One-time
integration into the **Sender** project (`.vault/subscriptions.gs` or wherever your current
deployment's source lives):

1. Delete the old `buildNewsletterHtml_`, `buildNewsletterText_`, `escapeHtml_`, and `BRAND`
   block.
2. Paste in the generated file's contents in its place.
3. Where `SITE_DOMAIN` and the old `const URLS = {...}` block used to be, replace the `URLS`
   object with `const URLS = urlsForDomain_(SITE_DOMAIN);` (the generated file defines
   `urlsForDomain_`, given `SITE_DOMAIN` is already defined elsewhere in the project).

After that first integration, whenever the template needs a design change: edit
`template.ts`, re-run the sync command, and re-paste the regenerated block — no other file
should define this template again.

_Bigger picture: this keeps the current Apps Script architecture and just kills the drift. A
fuller move — managing the whole Apps Script project as real TypeScript in this repo via
Google's official `clasp` CLI, or moving off Apps Script entirely — is a larger, separate
decision; ask if you want that written up._

## Fixing the 100-emails/day ceiling

`MailApp.sendEmail` shares Gmail's standard consumer quota — 100 recipients/day across every
script on the account, which is what the amber banner on `/a/sender` is warning about. The
lowest-effort fix that keeps everything else (the Sheet, verify/unsubscribe, `/a/sender` itself)
unchanged: send through a transactional email API instead of `MailApp`. **Brevo**'s free tier is
300 emails/day forever, no card required — signup at brevo.com, grab an API key from
**SMTP & API → API Keys**.

In the **Sender** project's Script Properties, add `BREVO_API_KEY`. Then in `sendNewsletter_`,
replace the retry loop's `MailApp.sendEmail(...)` call with:

```js
function sendViaBrevo_(to, subject, text, html) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("BREVO_API_KEY");
  if (!apiKey) throw new Error("BREVO_API_KEY is not set in Script Properties.");

  const response = UrlFetchApp.fetch("https://api.brevo.com/v3/smtp/email", {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": apiKey },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      sender: { name: NEWSLETTER_SENDER_NAME, email: "hackgwinnett@gmail.com" }, // must be a verified Brevo sender
      to: [{ email: to }],
      replyTo: NEWSLETTER_REPLY_TO ? { email: NEWSLETTER_REPLY_TO } : undefined,
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (response.getResponseCode() >= 300) {
    throw new Error(
      `Brevo send failed (${response.getResponseCode()}): ${response.getContentText()}`,
    );
  }
}
```

and call `sendViaBrevo_(recipient.email, emailSubject, text, html)` where `MailApp.sendEmail(...)`
used to be. `MailApp.getRemainingDailyQuota()` no longer applies — either drop that check or
replace it with a fixed `300` (or whatever your current Brevo plan allows) so the resumable-send
logic still has a sane ceiling to stop at. **Verify a sender identity in Brevo first** (their
dashboard walks you through it) — sends from an unverified `from` address get rejected.

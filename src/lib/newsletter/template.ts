/**
 * The newsletter's email template — shared, byte-for-byte, between the live preview in
 * `/a/sender` and the actual send. This file must stay a self-contained ES module with zero
 * imports: it's also synced (see `scripts/sync-newsletter-template.ts`) into the Apps Script
 * project that does the real sending, which has no bundler and can't resolve `import`.
 *
 * Email clients need inline styles and table-based layout (no external stylesheet, no flexbox/
 * grid support in most of them), which is why this looks nothing like the rest of the site.
 */

export type BrandTokens = {
  black: string;
  green: string;
  greenAlt: string;
  bodyFont: string;
  monoFont: string;
};

export const DEFAULT_BRAND: BrandTokens = {
  black: "#01150b", // --hg-black
  green: "#008236", // --primary (buttons, links)
  greenAlt: "#004a15", // --hg-green-alt (footer bar)
  bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  monoFont: "'Courier New', Courier, monospace",
};

export type NewsletterUrls = {
  home: string;
  logo: string;
  instagram: string;
  youtube: string;
  x: string;
};

export function urlsForDomain(siteDomain: string): NewsletterUrls {
  return {
    home: `https://${siteDomain}`,
    logo: `https://${siteDomain}/assets/images/brand/hackgwinnett.svg`,
    instagram: `https://${siteDomain}/go/instagram`,
    youtube: `https://${siteDomain}/go/youtube`,
    x: `https://${siteDomain}/go/x`,
  };
}

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type NewsletterData = {
  title: string;
  contentHtml: string;
  contentText: string;
  postUrl: string;
  unsubscribeUrl: string;
  isTest?: boolean;
};

/**
 * ==========================================================
 * HTML
 * ==========================================================
 */
export function buildNewsletterHtml(
  data: NewsletterData,
  urls: NewsletterUrls,
  brand: BrandTokens = DEFAULT_BRAND,
): string {
  const { title, contentHtml, postUrl, unsubscribeUrl, isTest } = data;

  const articleButton = postUrl
    ? `
        <div style="margin:30px 0 10px;">
          <a
            href="${escapeHtml(postUrl)}"
            style="
              display:inline-block;
              padding:14px 24px;
              background:${brand.green};
              color:#ffffff;
              text-decoration:none;
              font-weight:700;
              font-size:13px;
              letter-spacing:0.08em;
              text-transform:uppercase;
            "
          >
            Read on HackGwinnett &rarr;
          </a>
        </div>
      `
    : "";

  const testBanner = isTest
    ? `
        <div style="padding:10px 20px;background:#fef3c7;color:#92400e;font-size:13px;text-align:center;">
          TEST SEND — this unsubscribe link is not real.
        </div>
      `
    : "";

  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    ${escapeHtml(title)}
  </title>
</head>


<body
  style="
    margin:0;
    padding:0;
    background:#f4f4f5;
    font-family:${brand.bodyFont};
    color:#18181b;
  "
>

${testBanner}

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    width:100%;
    background:#f4f4f5;
  "
>

<tr>

<td
  align="center"
  style="
    padding:32px 12px;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width:680px;
    width:100%;
    background:#ffffff;
  "
>


<!-- HEADER -->

<tr>

<td
  style="
    padding:28px 30px;
    text-align:center;
    background:${brand.green};
  "
>

<a
  href="${urls.home}"
  style="text-decoration:none;"
>

<img
  src="${urls.logo}"
  alt="HackGwinnett"
  style="
    max-width:220px;
    max-height:70px;
    display:inline-block;
    border:0;
  "
>

</a>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td
  style="
    padding:38px 34px;
    font-size:16px;
    line-height:1.7;
  "
>

${
  title
    ? `
      <h1
        style="
          margin:0 0 24px;
          font-size:28px;
          line-height:1.2;
          font-family:${brand.monoFont};
          font-weight:700;
          color:#0a0a0a;
        "
      >
        ${escapeHtml(title)}
      </h1>
    `
    : ""
}


<div>
  ${contentHtml}
</div>


${articleButton}


</td>

</tr>


<!-- FOOTER -->

<tr>

<td
  style="
    padding:30px;
    background:${brand.greenAlt};
    text-align:center;
  "
>

<p
  style="
    margin:0 0 18px;
    font-size:13px;
    line-height:1.5;
    color:#d4d4d8;
  "
>
  You're receiving this email because you
  subscribed to the HackGwinnett mailing list.
</p>


<p
  style="
    margin:0 0 18px;
    font-size:14px;
  "
>

<a
  href="${urls.instagram}"
  style="
    color:#ffffff;
    text-decoration:none;
    margin:0 8px;
  "
>
  Instagram
</a>


<a
  href="${urls.youtube}"
  style="
    color:#ffffff;
    text-decoration:none;
    margin:0 8px;
  "
>
  YouTube
</a>


<a
  href="${urls.x}"
  style="
    color:#ffffff;
    text-decoration:none;
    margin:0 8px;
  "
>
  X
</a>

</p>


<p
  style="
    margin:0;
    font-size:12px;
  "
>

<a
  href="${unsubscribeUrl}"
  style="
    color:#a7f3c8;
    text-decoration:underline;
  "
>
  Unsubscribe
</a>

</p>


</td>

</tr>


</table>


<p
  style="
    margin:18px 0 0;
    font-size:12px;
    font-family:${brand.monoFont};
    color:#a1a1aa;
  "
>
  © ${new Date().getFullYear()} HackGwinnett
</p>


</td>

</tr>

</table>

</body>

</html>
`;
}

/**
 * ==========================================================
 * PLAINTEXT FALLBACK
 * ==========================================================
 */
export function buildNewsletterText(data: NewsletterData, urls: NewsletterUrls): string {
  const { title, contentText, postUrl, unsubscribeUrl } = data;

  let output = "";

  if (title) {
    output += `${title}\n\n`;
  }

  output += contentText || "";

  if (postUrl) {
    output += `\n\nRead on HackGwinnett:\n` + `${postUrl}`;
  }

  output +=
    `\n\n` +
    `--------------------------------\n` +
    `You're receiving this email because you ` +
    `subscribed to the HackGwinnett newsletter.\n\n` +
    `Unsubscribe:\n` +
    `${unsubscribeUrl}\n\n` +
    `Instagram:\n${urls.instagram}\n` +
    `YouTube:\n${urls.youtube}\n` +
    `X:\n${urls.x}\n`;

  return output;
}

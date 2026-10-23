# Demo content sources

The copy in `content.json` is adapted from the Ubuntu.com product pages below and ships with this repository. Seeding does not need a separate checkout, live CMS or runtime scraping. The demo does not reproduce full page layouts, release-specific announcements, prices or customer quotes.

| Ubuntu.com source            | Reference file                   | Used for                                                                          |
| ---------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| https://ubuntu.com/desktop   | `templates/desktop/index.html`   | Desktop, homepage, desktop/server comparison, campus scenario, open-source story  |
| https://ubuntu.com/server    | `templates/server/index.html`    | Server, homepage, desktop/server comparison, research scenario, open-source story |
| https://ubuntu.com/pro       | `templates/pro/index.html`       | LTS/Pro comparison, security story, maintenance and security descriptions         |
| https://ubuntu.com/openstack | `templates/openstack/index.html` | Research scenario and open-source story                                           |

The two case studies remain **fictional, illustrative scenarios** based on these product capabilities. They are not real customer stories and claim no measured results, savings or endorsements. People, machines and subscription details in the dashboard are also fictional.

These are editorial snapshots for a demonstration, not an authoritative statement of current release availability, commercial terms or support entitlements. Check the linked product pages for current information.

The content remains plain text in Strapi. The website reads it only at build time. Normal startup seeding adds missing entries and does not overwrite editor changes.

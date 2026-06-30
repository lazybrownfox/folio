# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this static Astro portfolio site. A `posthog.astro` component was created and inserted into the site's root `Base.astro` layout, initialising PostHog via the web snippet on every page. Type declarations were added in `src/env.d.ts` so TypeScript knows about `window.posthog`. Ten custom events are now captured across six files, covering the entire visitor journey from first scroll to contact-email click.

| Event | Description | File |
|---|---|---|
| `contact_email_clicked` | User clicks the email CTA — the primary portfolio conversion | `src/pages/index.astro` |
| `contact_section_viewed` | User scrolls into the contact section (top of conversion funnel) | `src/pages/index.astro` |
| `work_project_opened` | User opens a work project in the gallery modal (`project_name`, `project_tag`) | `src/components/WorkGallery.tsx` |
| `work_project_closed` | User closes the work gallery modal (`project_name`) | `src/components/WorkGallery.tsx` |
| `work_project_navigated` | User navigates prev/next inside the gallery (`from_project`, `to_project`, `direction`) | `src/components/WorkGallery.tsx` |
| `dataviz_scenario_switched` | User switches financial scenarios in the net contributions chart (`scenario_id`, `scenario_name`, `previous_scenario_id`) | `src/components/dataviz/NetContributionsChart.tsx` |
| `projection_strategy_toggled` | User toggles between secured/unsecured projection strategies (`strategy`) | `src/components/dataviz/ProjectionChart.tsx` |
| `mode_toggled` | User switches between Story and Libre reading modes (`mode`) | `src/scripts/site.ts` |
| `nav_section_clicked` | User clicks a header nav link to jump to a section (`section`, `href`) | `src/components/Header.astro` |
| `alba_theme_toggled` | User manually toggles the Alba design system showcase theme (`theme`) | `src/components/AlbaShowcase.tsx` |

## Next steps

We've built a dashboard and five insights in PostHog to monitor visitor behaviour:

- **Dashboard**: [Analytics basics (wizard)](https://eu.posthog.com/project/211406/dashboard/778827)
- [Contact conversion funnel (wizard)](https://eu.posthog.com/project/211406/insights/knkZGLmE) — contact_section_viewed → contact_email_clicked
- [Portfolio engagement over time (wizard)](https://eu.posthog.com/project/211406/insights/PN4wqdlu) — work_project_opened daily trend
- [Most popular work projects (wizard)](https://eu.posthog.com/project/211406/insights/2WTcDKzc) — work_project_opened by project_name
- [Dataviz engagement (wizard)](https://eu.posthog.com/project/211406/insights/uNU1JHPK) — scenario switches and strategy toggles over time
- [Reading mode preference (wizard)](https://eu.posthog.com/project/211406/insights/qG6Ncrlf) — Story vs Libre mode_toggled breakdown

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `PUBLIC_POSTHOG_PROJECT_TOKEN` and `PUBLIC_POSTHOG_HOST` to `.env.example` and any team onboarding scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-astro-static/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

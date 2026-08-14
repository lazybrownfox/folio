import { config, fields, collection } from "@keystatic/core";

const imageFit = fields.select({
  label: "Fit",
  description: "Leave unset to inherit the project's default fit.",
  options: [
    { label: "(inherit)", value: "" },
    { label: "Cover", value: "cover" },
    { label: "Contain", value: "contain" },
  ],
  defaultValue: "",
});

const workImageSchema = {
  src: fields.text({
    label: "Image path",
    description: "e.g. /work/shots/example.jpg",
    validation: { isRequired: true },
  }),
  alt: fields.text({ label: "Alt text", multiline: true, validation: { isRequired: true } }),
  video: fields.text({ label: "Video path (optional)", description: "e.g. /work/video/example.mp4" }),
  videoAspect: fields.text({
    label: "Video aspect ratio (optional)",
    description: 'CSS aspect-ratio, e.g. "452 / 928"',
  }),
  fit: imageFit,
  bg: fields.text({ label: "Background colour (optional)", description: "e.g. #0a0d12" }),
  position: fields.text({ label: "CSS object-position (optional)" }),
  caption: fields.text({ label: "Caption (optional)", multiline: true }),
};

export default config({
  storage: { kind: "local" },
  collections: {
    work: collection({
      label: "Work",
      path: "src/content/work/*",
      format: { data: "json" },
      slugField: "slug",
      entryLayout: "form",
      schema: {
        slug: fields.slug({
          name: {
            label: "Slug",
            description: "URL slug, exactly as typed (e.g. cosmo-connected).",
          },
        }),
        name: fields.text({ label: "Display name", validation: { isRequired: true } }),
        tag: fields.text({ label: "Tag (shown on the index row)" }),
        role: fields.text({ label: "Role" }),
        order: fields.integer({
          label: "Order",
          description: "Controls position everywhere: index rows and the prev/next rail.",
          defaultValue: 0,
        }),
        images: fields.array(fields.object(workImageSchema), {
          label: "Index images",
          description: "images[0] is the one that floods the index-row section.",
          itemLabel: (props) => props.fields.alt.value || "Image",
        }),
        fit: imageFit,
        bg: fields.text({ label: "Background colour, index row (optional)" }),
        study: fields.conditional(
          fields.checkbox({ label: "Has a case-study page", defaultValue: false }),
          {
            true: fields.object({
              subtitle: fields.text({
                label: "Subtitle",
                description: "One sentence under the title.",
                multiline: true,
              }),
              services: fields.array(fields.text({ label: "Service" }), {
                label: "Services (contribution)",
                itemLabel: (props) => props.value || "Service",
              }),
              sector: fields.text({ label: "Sector" }),
              year: fields.text({ label: "Year (optional)", description: 'e.g. "2019–22"' }),
              hero: fields.object(workImageSchema),
              sections: fields.array(
                fields.object({
                  heading: fields.text({ label: "Heading", validation: { isRequired: true } }),
                  body: fields.text({ label: "Body", multiline: true }),
                  facts: fields.array(
                    fields.object({
                      title: fields.text({ label: "Title" }),
                      body: fields.text({ label: "Body", multiline: true }),
                    }),
                    {
                      label: "Facts (optional short list, rendered as cards)",
                      itemLabel: (props) => props.fields.title.value || "Fact",
                    },
                  ),
                  images: fields.array(fields.object(workImageSchema), {
                    label: "Images",
                    itemLabel: (props) => props.fields.alt.value || "Image",
                  }),
                }),
                {
                  label: "Sections",
                  itemLabel: (props) => props.fields.heading.value || "Section",
                },
              ),
              outro: fields.text({
                label: "Outro (optional)",
                description: "Closing line before the next-project rail.",
                multiline: true,
              }),
              tools: fields.array(fields.text({ label: "Tool" }), {
                label: "Tools (optional)",
                description: "What was actually used to design/build/rebuild this.",
                itemLabel: (props) => props.value || "Tool",
              }),
            }),
            false: fields.empty(),
          },
        ),
      },
    }),
  },
});

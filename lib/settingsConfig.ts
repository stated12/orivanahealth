export type SettingDef = { key: string; label: string; type: "text" | "textarea" | "bool" | "number" | "csv" | "image"; group: string; help?: string };
export const SETTINGS: SettingDef[] = [
  { key: "brand_name", label: "Brand name", type: "text", group: "Brand" }, { key: "brand_tagline", label: "Tagline", type: "text", group: "Brand" }, { key: "footer_note", label: "Footer note", type: "textarea", group: "Brand" },
  { key: "contact_email", label: "Contact email", type: "text", group: "Contact", help: "Shown on the website and used for notifications of new submissions. Enter only real details." }, { key: "contact_phone", label: "Contact phone", type: "text", group: "Contact" }, { key: "contact_address", label: "Contact address", type: "textarea", group: "Contact" },
  { key: "social_facebook", label: "Facebook URL", type: "text", group: "Social" }, { key: "social_instagram", label: "Instagram URL", type: "text", group: "Social" }, { key: "social_x", label: "X URL", type: "text", group: "Social" }, { key: "social_linkedin", label: "LinkedIn URL", type: "text", group: "Social" }, { key: "social_youtube", label: "YouTube URL", type: "text", group: "Social" },
  { key: "legal_name", label: "Legal name of the organisation", type: "text", group: "Legal status", help: "Enter only once confirmed. Leave empty otherwise." }, { key: "registered_address", label: "Registered address", type: "textarea", group: "Legal status" },
  { key: "legal_eligibility_verified", label: "ORIVANA's legal eligibility to receive donations has been verified (set ON only after legal confirmation)", type: "bool", group: "Donations", help: "Both this switch and the next one must be ON, and the payment provider keys must be set on the server, before the donation form accepts payments." },
  { key: "payments_enabled", label: "Accept online payments", type: "bool", group: "Donations" },
  { key: "payment_provider", label: "Payment provider (razorpay)", type: "text", group: "Donations" }, { key: "donation_presets", label: "Preset amounts (INR, comma separated)", type: "text", group: "Donations" }, { key: "donation_min", label: "Minimum donation (INR)", type: "number", group: "Donations" },
  { key: "fund_handling_text", label: "How funds are handled (public text, write only what is true)", type: "textarea", group: "Donations" }, { key: "tax_statement", label: "Tax / registration statement (leave empty unless legally verified)", type: "textarea", group: "Donations" }, { key: "receipt_note", label: "Note printed on donation acknowledgements", type: "textarea", group: "Donations" },
  { key: "img_home_hero", label: "Home: hero image (portrait 4:5)", type: "image", group: "Site images" },
  { key: "img_home_assistance", label: "Home: healthcare for the needy (4:3)", type: "image", group: "Site images" },
  { key: "img_home_tourism", label: "Home: medical tourism (4:3)", type: "image", group: "Site images" },
  { key: "img_home_training", label: "Home: medical training (4:3)", type: "image", group: "Site images" },
  { key: "img_home_equipment", label: "Home: medical equipment (4:3)", type: "image", group: "Site images" },
  { key: "img_home_partners", label: "Home: healthcare partners (4:3)", type: "image", group: "Site images" },
  { key: "img_care_page", label: "ORIVANA Care page image (16:9)", type: "image", group: "Site images" },
  { key: "img_tourism_page", label: "Medical tourism page image (16:9)", type: "image", group: "Site images" },
  { key: "seo_default_title", label: "Default SEO title", type: "text", group: "SEO" }, { key: "seo_default_description", label: "Default SEO description", type: "textarea", group: "SEO" },
];
export const PERMISSIONS = ["dashboard.read", "cases.read", "cases.manage", "tourism.manage", "documents.read", "donations.read", "donations.manage", "donations.reports", "directory.write", "partners.write", "training.write", "equipment.write", "events.write", "forms.read", "forms.manage", "content.write", "media.write", "notifications.read", "settings.write", "users.manage", "audit.read"];

-- Public marketing contact — editable from Sleekly Dash Settings.
-- Single-row table (id = 1). Seeded with current public defaults.

CREATE TABLE IF NOT EXISTS site_contact_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  brand_name VARCHAR(120) NOT NULL DEFAULT 'SleeklyBuilt',
  email VARCHAR(190) NOT NULL DEFAULT 'sales@sleeklybuilt.pro',
  location VARCHAR(190) NOT NULL DEFAULT 'Kampala, Uganda',
  address_note VARCHAR(255) NOT NULL DEFAULT 'Office under development',
  phones_json JSON NOT NULL,
  primary_phone VARCHAR(40) NOT NULL DEFAULT '+256791779448',
  whatsapp_url VARCHAR(255) NOT NULL DEFAULT 'https://wa.me/256749594464',
  social_json JSON NOT NULL,
  logo_path VARCHAR(255) NOT NULL DEFAULT '/assets/img/sleeklybuilt-logo.png',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_contact_settings (
  id,
  brand_name,
  email,
  location,
  address_note,
  phones_json,
  primary_phone,
  whatsapp_url,
  social_json,
  logo_path
) VALUES (
  1,
  'SleeklyBuilt',
  'sales@sleeklybuilt.pro',
  'Kampala, Uganda',
  'Office under development',
  JSON_ARRAY('+256 791779448', '+256 749594464', '+256 772169960'),
  '+256791779448',
  'https://wa.me/256749594464',
  JSON_OBJECT(
    'x', 'https://x.com/sleeklybuilt',
    'instagram', 'https://www.instagram.com/sleeklybuilt/?hl=en',
    'linkedin', 'https://www.linkedin.com/company/sleeklybuilt/',
    'youtube', 'https://www.youtube.com/@SleeklyBuilt'
  ),
  '/assets/img/sleeklybuilt-logo.png'
)
ON DUPLICATE KEY UPDATE id = id;

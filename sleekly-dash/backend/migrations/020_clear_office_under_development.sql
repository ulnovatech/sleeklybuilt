-- Remove legacy "Office under development" address note from public contact settings.
UPDATE site_contact_settings
SET address_note = 'By appointment · Kampala'
WHERE id = 1
  AND (
    address_note = 'Office under development'
    OR address_note = 'Address coming soon. Office under development'
    OR TRIM(address_note) = ''
  );

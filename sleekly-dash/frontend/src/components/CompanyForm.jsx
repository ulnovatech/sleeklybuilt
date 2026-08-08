import React, { useEffect, useState } from 'react';

const empty = { 
  name:'', 
  industry:'', 
  website_url:'', 
  has_website:0, 
  location:'', 
  contact_person:'', 
  contact_method:'whatsapp', 
  contact_phone:'',
  contact_email:'',
  contact_whatsapp:'',
  status:'not_contacted', 
  priority:'medium', 
  last_contact_date:'', 
  notes:'',
  project_value_ugx:'',
  services_sold:'',
  loss_reason:'',
  closed_at:'',
};

// Industry list
const industries = [
  "Agriculture & Farming",
  "Manufacturing & Production",
  "Construction & Real Estate",
  "Retail & E-commerce",
  "Technology & Software",
  "Finance & Banking",
  "Education & Training",
  "Healthcare & Wellness",
  "Legal & Professional Services",
  "Transport & Logistics",
  "Hospitality",
  "Travel & Tourism",
  "Media & Entertainment",
  "Arts & Design",
  "Events & Experiences",
  "Sports & Recreation",
  "Energy & Utilities",
  "Telecommunications",
  "Mining & Natural Resources",
  "Government & Public Sector",
  "Nonprofit & NGOs"
];

export default function CompanyForm({ open, initial=null, onClose, onSubmit }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      const services =
        Array.isArray(initial.services_sold)
          ? initial.services_sold.join(', ')
          : typeof initial.services_sold === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(initial.services_sold);
                  return Array.isArray(parsed) ? parsed.join(', ') : initial.services_sold;
                } catch {
                  return initial.services_sold;
                }
              })()
            : '';
      setForm({
        ...empty,
        ...initial,
        has_website: initial.has_website ? 1 : 0,
        project_value_ugx: initial.project_value_ugx ?? '',
        services_sold: services,
        loss_reason: initial.loss_reason || '',
        closed_at: initial.closed_at ? String(initial.closed_at).slice(0, 10) : '',
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  if (!open) return null;

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name required');
    const closed = form.status === 'closed_won' || form.status === 'closed_lost';
    const servicesList = String(form.services_sold || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      ...form,
      has_website: Number(form.has_website),
      project_value_ugx:
        form.project_value_ugx === '' || form.project_value_ugx === null
          ? null
          : Number(form.project_value_ugx),
      services_sold: closed && servicesList.length ? servicesList : (closed ? [] : null),
      loss_reason: form.status === 'closed_lost' ? (form.loss_reason || null) : null,
      closed_at: closed ? (form.closed_at || null) : null,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40 p-4">
      <form 
        onSubmit={submit} 
        className="w-full max-w-2xl p-6 rounded-2xl shadow-xl space-y-4 bg-gradient-to-r from-accent-purple/40 to-accent-blue/10 text-white"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-red text-lg font-semibold">
            {initial ? 'Edit Company' : 'Add Company'}
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-black px-3 py-1 text-red rounded"
          >
            Close
          </button>
        </div>

        {/* Company name */}
        <input 
          className="rounded px-3 py-2 w-full" 
          placeholder="Company name" 
          value={form.name} 
          onChange={e => update('name', e.target.value)} 
          required 
        />

        <div className="grid grid-cols-2 gap-2">

          {/* Industry Dropdown */}
          <select 
            className="rounded px-3 py-2" 
            value={form.industry} 
            onChange={e => update('industry', e.target.value)}
          >
            <option value="">Select Industry</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          {/* Website URL */}
          <input 
            className="rounded px-3 py-2" 
            placeholder="Website URL" 
            value={form.website_url} 
            onChange={e => update('website_url', e.target.value)} 
          />

          {/* Has Website */}
          <select 
            className="rounded px-3 py-2" 
            value={form.has_website} 
            onChange={e => update('has_website', Number(e.target.value))}
          >
            <option value={0}>No site</option>
            <option value={1}>Has site</option>
          </select>

          {/* Location */}
          <input 
            className="bg-blackborder rounded px-3 py-2" 
            placeholder="Location" 
            value={form.location} 
            onChange={e => update('location', e.target.value)} 
          />

          {/* Contact Person */}
          <input 
            className="bg-blackborder rounded px-3 py-2" 
            placeholder="Contact person" 
            value={form.contact_person} 
            onChange={e => update('contact_person', e.target.value)} 
          />

          {/* Contact Phone */}
          <input 
            className="bg-blackborder rounded px-3 py-2" 
            placeholder="Contact phone" 
            value={form.contact_phone} 
            onChange={e => update('contact_phone', e.target.value)} 
          />

          {/* Contact Email */}
          <input 
            className="bg-blackborder rounded px-3 py-2" 
            placeholder="Contact email" 
            value={form.contact_email} 
            onChange={e => update('contact_email', e.target.value)} 
          />

          {/* WhatsApp Number */}
          <input 
            className="bg-blackborder rounded px-3 py-2" 
            placeholder="WhatsApp number" 
            value={form.contact_whatsapp} 
            onChange={e => update('contact_whatsapp', e.target.value)} 
          />

          {/* Contact Method */}
          <select 
            className="rounded px-3 py-2" 
            value={form.contact_method} 
            onChange={e => update('contact_method', e.target.value)}
          >
            {['phone','whatsapp','email','social'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Status */}
          <select 
            className="rounded px-3 py-2" 
            value={form.status} 
            onChange={e => update('status', e.target.value)}
          >
            {['not_contacted','contacted','interested','in_negotiation','rejected','closed_won','closed_lost'].map(s => (
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </select>

          {/* Last Contact Date */}
          <input 
            type="date" 
            className="rounded px-3 py-2" 
            value={form.last_contact_date || ''} 
            onChange={e => update('last_contact_date', e.target.value)} 
          />
        </div>

        {(form.status === 'closed_won' || form.status === 'closed_lost') && (
          <div className="grid grid-cols-2 gap-2 border border-white/10 rounded-xl p-3">
            <label className="text-xs text-white/70 col-span-2">Close outcome (feeds Discovery bridge)</label>
            <input
              type="number"
              min="0"
              className="rounded px-3 py-2"
              placeholder="Project value (UGX)"
              value={form.project_value_ugx}
              onChange={(e) => update('project_value_ugx', e.target.value)}
            />
            <input
              type="date"
              className="rounded px-3 py-2"
              value={form.closed_at || ''}
              onChange={(e) => update('closed_at', e.target.value)}
            />
            <input
              className="rounded px-3 py-2 col-span-2"
              placeholder="Services sold (comma-separated ids, e.g. website_build, booking)"
              value={form.services_sold}
              onChange={(e) => update('services_sold', e.target.value)}
            />
            {form.status === 'closed_lost' && (
              <input
                className="rounded px-3 py-2 col-span-2"
                placeholder="Loss reason"
                value={form.loss_reason}
                onChange={(e) => update('loss_reason', e.target.value)}
              />
            )}
          </div>
        )}

        {/* Notes */}
        <textarea 
          className="rounded px-3 py-2 w-full" 
          rows={4} 
          placeholder="Notes" 
          value={form.notes} 
          onChange={e => update('notes', e.target.value)} 
        />

        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded bg-gray-100"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {initial ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

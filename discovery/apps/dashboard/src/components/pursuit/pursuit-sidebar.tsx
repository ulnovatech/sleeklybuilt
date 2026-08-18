'use client';

import { Copy, Download, Mail, MessageCircle } from 'lucide-react';
import { Button, StatusBadge } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import type { CaseFileUi } from './types';

function waTone(status: CaseFileUi['contact']['whatsapp']['status']) {
  if (status === 'wa_ready') return 'success' as const;
  if (status === 'wa_probable') return 'warning' as const;
  if (status === 'wa_unreliable') return 'danger' as const;
  return 'neutral' as const;
}

export function PursuitSidebar({ caseFile }: { caseFile: CaseFileUi }) {
  const { push } = useToast();
  const { contact, pursuitContext } = caseFile;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      push({ tone: 'success', title: `${label} copied` });
    } catch {
      push({ tone: 'error', title: `Could not copy ${label.toLowerCase()}` });
    }
  };

  const downloadVcard = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${caseFile.identity.name}`,
      contact.phone ? `TEL;TYPE=WORK,VOICE:${contact.phone}` : null,
      contact.email ? `EMAIL;TYPE=WORK:${contact.email}` : null,
      caseFile.presence.website ? `URL:${caseFile.presence.website}` : null,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/vcard' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseFile.identity.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'business'}-contact.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lastOutreach = pursuitContext?.lastOutreach;
  const followUpDue = pursuitContext?.nextFollowUpAt;

  return (
    <aside className="space-y-4 rounded-lg border border-line bg-surface p-4 shadow-panel">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Contact</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={downloadVcard}
            disabled={!contact.phone && !contact.email}
          >
            <Download className="h-3.5 w-3.5" />
            Save contact
          </Button>
          {contact.email && (
            <Button size="sm" asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            </Button>
          )}
          {contact.whatsapp.waMeUrl && contact.whatsapp.status !== 'wa_blocked' && (
            <Button size="sm" variant="secondary" asChild>
              <a href={contact.whatsapp.waMeUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {contact.email && (
            <button
              type="button"
              onClick={() => void copy(contact.email!, 'Email')}
              className="flex w-full items-center justify-between gap-2 rounded-md border border-line px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-raised"
            >
              <span className="truncate">{contact.email}</span>
              <Copy className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            </button>
          )}
          {contact.phone && (
            <button
              type="button"
              onClick={() => void copy(contact.phone!, 'Phone')}
              className="flex w-full items-center justify-between gap-2 rounded-md border border-line px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-raised"
            >
              <span>{contact.phone}</span>
              <Copy className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            </button>
          )}
          {!contact.email && !contact.phone && (
            <p className="text-sm text-ink-muted">No verified contact path.</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">WhatsApp screening</p>
        <div className="mt-2 rounded-md bg-surface-raised p-3">
          <StatusBadge tone={waTone(contact.whatsapp.status)}>
            {contact.whatsapp.status.replace('wa_', '').replace('_', ' ')}
          </StatusBadge>
          <p className="mt-2 text-xs leading-5 text-ink-muted">{contact.whatsapp.reason}</p>
        </div>
      </div>

      {lastOutreach && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Last outreach</p>
          <p className="mt-1 text-sm capitalize text-ink">{lastOutreach.channel}</p>
          <p className="text-xs text-ink-muted">
            {new Date(lastOutreach.sentAt).toLocaleString()}
          </p>
          {lastOutreach.subject && (
            <p className="mt-1 truncate text-xs text-ink-muted">{lastOutreach.subject}</p>
          )}
        </div>
      )}

      {followUpDue && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Follow-up due</p>
          <p className="mt-1 text-sm text-ink">{new Date(followUpDue).toLocaleString()}</p>
        </div>
      )}
    </aside>
  );
}

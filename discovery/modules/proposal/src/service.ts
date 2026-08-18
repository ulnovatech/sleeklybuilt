import { CrmService } from '@agency/crm';
import { platformSettings, type AgencyPackage } from '@agency/settings';
import { ProposalRepository } from './repository';
import { assertLeadCanCreateProposal, assertLeadCanSendProposal } from './rules';
import type { LeadStatus } from '@agency/types';

export class ProposalService {
  private repo = new ProposalRepository();
  private crm = new CrmService();

  async create(data: {
    leadId: string;
    title: string;
    amount: number;
    body?: string;
    autoQualify?: boolean;
    packageId?: string;
  }) {
    const ctx = await this.repo.getLeadContext(data.leadId);
    if (!ctx) throw new Error('Lead not found');

    const status = ctx.lead.status as LeadStatus;
    assertLeadCanCreateProposal(status, data.autoQualify);

    if (status === 'REPLIED' && data.autoQualify) {
      await this.crm.transition(data.leadId, 'QUALIFIED', 'Auto-qualified for proposal');
    }

    await platformSettings.ensureLoaded();
    const agency = platformSettings.getAgencySettings();
    const pkg = data.packageId
      ? agency.packages.find((p: AgencyPackage) => p.id === data.packageId)
      : undefined;

    const amount = pkg ? pkg.priceUgx : data.amount;
    const title = data.title.trim() || pkg?.title || `Proposal for ${ctx.business.name}`;
    const body =
      data.body ??
      this.generateDraftBody(ctx.business.name, amount, {
        agencyBrand: agency.brandName,
        currency: agency.currency,
        packageTitle: pkg?.title,
        depositUgx: pkg?.depositUgx,
      });

    return this.repo.create({
      leadId: data.leadId,
      title,
      amount,
      body,
    });
  }

  async markSent(proposalId: string) {
    const proposal = await this.repo.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'draft') {
      throw new Error(`Cannot send proposal with status ${proposal.status}`);
    }

    const lead = await this.crm.getLead(proposal.leadId);
    if (!lead) throw new Error('Lead not found');
    assertLeadCanSendProposal(lead.status as LeadStatus);

    await this.repo.updateStatus(proposalId, 'sent');
    await this.crm.transition(proposal.leadId, 'PROPOSAL_SENT', 'Proposal sent to client');
    return this.repo.get(proposalId);
  }

  list(leadId?: string) {
    return this.repo.list(leadId);
  }

  listWithDetails(leadId?: string) {
    return this.repo.listWithDetails(leadId);
  }

  get(id: string) {
    return this.repo.get(id);
  }

  getLatestSentForLead(leadId: string) {
    return this.repo.getLatestSentForLead(leadId);
  }

  acceptProposal(proposalId: string, leadId: string) {
    return this.repo.get(proposalId).then(async (proposal) => {
      if (!proposal || proposal.leadId !== leadId) {
        throw new Error('Proposal not found for this lead');
      }
      if (proposal.status !== 'sent') {
        throw new Error(`Proposal must be sent before closing deal (status: ${proposal.status})`);
      }
      await this.repo.updateStatus(proposalId, 'accepted');
      return proposal;
    });
  }

  listPackagePresets(): AgencyPackage[] {
    return platformSettings.getAgencySettings().packages;
  }

  generateDraftBody(
    businessName: string,
    amount: number,
    opts?: {
      agencyBrand?: string;
      currency?: string;
      packageTitle?: string;
      depositUgx?: number;
    },
  ) {
    const brand = opts?.agencyBrand?.trim() || 'We';
    const currency = opts?.currency ?? 'UGX';
    const packageLine = opts?.packageTitle
      ? `Recommended package: ${opts.packageTitle}.\n\n`
      : '';
    const depositLine =
      opts?.depositUgx != null
        ? `Suggested deposit: ${currency} ${opts.depositUgx.toLocaleString()}\n\n`
        : '';
    const investment =
      currency === 'UGX'
        ? `UGX ${amount.toLocaleString()}`
        : `$${amount.toLocaleString()}`;
    const recommend = brand.toLowerCase() === 'we' ? 'recommend' : 'recommends';

    return `Proposal for ${businessName}\n\n${packageLine}${brand} ${recommend} a web development package tailored to your goals.\n\nEstimated investment: ${investment}\n${depositLine}Includes discovery, design, development, and launch support.`;
  }
}

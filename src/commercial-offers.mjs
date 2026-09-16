import { isFresh, affiliateDecision } from './domain.mjs';

const PROGRAM_BY_PROVIDER = Object.freeze({ awin: 'awin', ebay: 'ebay-epn' });
const MEDIA_SOURCE_BY_PROVIDER = Object.freeze({ awin: 'AWIN_FEED', ebay: 'EBAY_BROWSE_API' });
const PROVIDER_PRIORITY = ['awin', 'ebay'];

function evidenceOk(project, file) {
  return typeof file === 'string' && file.length > 0 && typeof project.evidenceExists === 'function' && project.evidenceExists(file);
}

function approvedProgramme(project, provider, origin, now) {
  const programId = PROGRAM_BY_PROVIDER[provider];
  const program = project.programs?.find(x => x.id === programId);
  if (!program || program.status !== 'APPROVED') return { ok: false, reason: 'PROGRAM_NOT_APPROVED' };
  if (!program.accountId || !evidenceOk(project, program.approvalEvidenceFile)) return { ok: false, reason: 'PROGRAM_APPROVAL_EVIDENCE_MISSING' };
  if (!origin || program.approvedSiteOrigin !== origin) return { ok: false, reason: 'PROGRAM_SITE_NOT_APPROVED' };
  if (!isFresh(program.termsReviewedAt, project.site.sourceMaxAgeDays, now)) return { ok: false, reason: 'PROGRAM_TERMS_STALE' };
  return { ok: true, program, programId };
}

function approvedMapping(project, productId, provider, now) {
  const mapping = project.providerMappings?.find(x => x.productId === productId && x.provider === provider);
  if (!mapping) return { ok: false, reason: 'NO_PROVIDER_MAPPING' };
  if (mapping.status !== 'APPROVED') return { ok: false, reason: 'PROVIDER_MAPPING_NOT_APPROVED' };
  if (!mapping.reviewedBy || !isFresh(mapping.reviewedAt, project.site.sourceMaxAgeDays, now) || !evidenceOk(project, mapping.approvalEvidenceFile)) return { ok: false, reason: 'PROVIDER_MAPPING_EVIDENCE_MISSING_OR_STALE' };
  return { ok: true, mapping };
}

function currentOffer(project, mapping, now) {
  const offer = project.providerOffers?.find(x => x.provider === mapping.provider && x.productId === mapping.productId && String(x.externalProductId) === String(mapping.externalProductId));
  if (!offer) return { ok: false, reason: 'NO_CURRENT_PROVIDER_OFFER' };
  if (offer.status === 'REVOKED') return { ok: false, reason: 'PROVIDER_OFFER_REVOKED' };
  if (!['STAGED', 'APPROVED'].includes(offer.status)) return { ok: false, reason: 'PROVIDER_OFFER_NOT_USABLE' };
  if (!isFresh(offer.checkedAt, project.site.sourceMaxAgeDays, now)) return { ok: false, reason: 'PROVIDER_OFFER_STALE' };
  if (!offer.trackingUrl) return { ok: false, reason: 'PROVIDER_TRACKING_URL_MISSING' };
  return { ok: true, offer };
}

export function providerOfferDecision(product, project, origin, now = new Date()) {
  const inactive = reason => ({ active: false, reason, url: product.source.url, kind: 'RESEARCH_ONLY' });
  if (!project.site?.monetization?.enabled) return inactive('MONETIZATION_DISABLED');
  if (!isFresh(product.source?.checkedAt, project.site.sourceMaxAgeDays, now)) return inactive('STALE_SOURCE');

  const productMappings = project.providerMappings?.filter(x => x.productId === product.id && ['awin', 'ebay'].includes(x.provider)) || [];
  if (!productMappings.length) return inactive('NO_PROVIDER_MAPPING');

  const reasons = [];
  for (const provider of PROVIDER_PRIORITY) {
    if (!productMappings.some(x => x.provider === provider)) continue;
    const programme = approvedProgramme(project, provider, origin, now); if (!programme.ok) { reasons.push(programme.reason); continue; }
    const mapped = approvedMapping(project, product.id, provider, now); if (!mapped.ok) { reasons.push(mapped.reason); continue; }
    const live = currentOffer(project, mapped.mapping, now); if (!live.ok) { reasons.push(live.reason); continue; }
    const media = mapped.mapping.mediaApproved === true && live.offer.imageUrl
      ? { status: 'APPROVED', source: MEDIA_SOURCE_BY_PROVIDER[provider], url: live.offer.imageUrl, alt: `${live.offer.title || product.name} product image`, checkedAt: live.offer.checkedAt }
      : null;
    return {
      active: true,
      reason: 'APPROVED_PROVIDER_OFFER',
      kind: 'AFFILIATE',
      provider,
      programId: programme.programId,
      url: live.offer.trackingUrl,
      price: live.offer.price || null,
      availability: live.offer.availability || null,
      media,
      checkedAt: live.offer.checkedAt
    };
  }
  return inactive(reasons[0] || 'NO_APPROVED_PROVIDER_OFFER');
}

export function commerceDecision(product, project, origin, now = new Date()) {
  const hasProviderMapping = project.providerMappings?.some(x => x.productId === product.id && ['awin', 'ebay'].includes(x.provider));
  if (hasProviderMapping) return providerOfferDecision(product, project, origin, now);
  return affiliateDecision(product, project, origin, now);
}

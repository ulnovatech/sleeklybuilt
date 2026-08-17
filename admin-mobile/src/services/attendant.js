import { apiFetch } from './api'

export function listEscalations() {
  return apiFetch('/attendant/escalations')
}

export function getConversation(id) {
  return apiFetch(`/attendant/conversations/${encodeURIComponent(id)}`)
}

export function takeoverConversation(id) {
  return apiFetch(`/attendant/conversations/${encodeURIComponent(id)}/takeover`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function resumeConversation(id) {
  return apiFetch(`/attendant/conversations/${encodeURIComponent(id)}/resume`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function postOperatorMessage(id, text, idempotencyKey) {
  return apiFetch(`/attendant/conversations/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    body: JSON.stringify({
      text,
      idempotency_key: idempotencyKey || undefined,
    }),
  })
}

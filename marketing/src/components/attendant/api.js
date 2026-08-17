/**
 * Attendant HTTP client — browser talks only to /php/attendant/*.
 */

export async function createSession() {
  const res = await fetch('/php/attendant/session.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    const err = new Error(data.error || 'Could not start session')
    err.code = data.code || 'backend_error'
    throw err
  }
  return data
}

/**
 * @param {{
 *   sessionToken: string,
 *   message: string,
 *   page: object,
 *   onEvent: (event: string, payload: object) => void,
 *   signal?: AbortSignal,
 * }} opts
 */
export async function streamChat({ sessionToken, message, page, onEvent, signal }) {
  const res = await fetch('/php/attendant/chat.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Attendant-Session': sessionToken,
    },
    body: JSON.stringify({
      session_token: sessionToken,
      message,
      page,
    }),
    signal,
  })

  if (!res.ok) {
    let payload = {}
    try {
      payload = await res.json()
    } catch {
      /* ignore */
    }
    const err = new Error(payload.error || payload.message || "I can't reply just now.")
    err.code = payload.code || (res.status === 401 ? 'unauthorized' : 'backend_error')
    throw err
  }

  if (!res.body) {
    throw Object.assign(new Error("I can't reply just now."), { code: 'backend_error' })
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''
    for (const chunk of chunks) {
      parseSseChunk(chunk, onEvent)
    }
  }
  if (buffer.trim()) {
    parseSseChunk(buffer, onEvent)
  }
}

function parseSseChunk(chunk, onEvent) {
  const lines = chunk.split('\n')
  let event = 'message'
  const dataLines = []
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }
  if (dataLines.length === 0) return
  try {
    const payload = JSON.parse(dataLines.join('\n'))
    onEvent(event, payload)
  } catch {
    /* ignore malformed */
  }
}

/**
 * @param {{ sessionToken: string, confirmationToken: string }} opts
 */
export async function confirmAction({ sessionToken, confirmationToken }) {
  const res = await fetch('/php/attendant/confirm.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Attendant-Session': sessionToken,
    },
    body: JSON.stringify({
      session_token: sessionToken,
      confirmation_token: confirmationToken,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || data.user_safe_error || 'Confirmation failed')
    err.code = data.code || 'backend_error'
    throw err
  }
  return data
}

/**
 * Poll messages after a cursor (human replies while escalated).
 * @param {{ sessionToken: string, afterId?: number }} opts
 */
export async function pollMessages({ sessionToken, afterId = 0 }) {
  const res = await fetch(
    `/php/attendant/messages.php?after_id=${encodeURIComponent(String(afterId || 0))}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Attendant-Session': sessionToken,
      },
    },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    const err = new Error(data.error || 'Could not load messages')
    err.code = data.code || 'backend_error'
    throw err
  }
  return data
}

/**
 * Select Decision UI option(s). Default resumes the turn as SSE (same events as chat).
 * @param {{
 *   sessionToken: string,
 *   choiceToken: string,
 *   optionIds: string[],
 *   page: object,
 *   onEvent: (event: string, payload: object) => void,
 *   signal?: AbortSignal,
 *   cancel?: boolean,
 * }} opts
 */
export async function selectChoice({
  sessionToken,
  choiceToken,
  optionIds,
  page,
  onEvent,
  signal,
  cancel = false,
}) {
  if (cancel) {
    const res = await fetch('/php/attendant/choice.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Attendant-Session': sessionToken,
      },
      body: JSON.stringify({
        session_token: sessionToken,
        choice_token: choiceToken,
        cancel: true,
      }),
      signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.error || 'Could not dismiss choices')
      err.code = data.code || 'backend_error'
      throw err
    }
    return data
  }

  const res = await fetch('/php/attendant/choice.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Attendant-Session': sessionToken,
    },
    body: JSON.stringify({
      session_token: sessionToken,
      choice_token: choiceToken,
      option_ids: optionIds,
      page,
    }),
    signal,
  })

  if (!res.ok) {
    let payload = {}
    try {
      payload = await res.json()
    } catch {
      /* ignore */
    }
    const err = new Error(payload.error || payload.message || "I can't reply just now.")
    err.code = payload.code || (res.status === 401 ? 'unauthorized' : 'backend_error')
    throw err
  }

  if (!res.body) {
    throw Object.assign(new Error("I can't reply just now."), { code: 'backend_error' })
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''
    for (const chunk of chunks) {
      parseSseChunk(chunk, onEvent)
    }
  }
  if (buffer.trim()) {
    parseSseChunk(buffer, onEvent)
  }
}

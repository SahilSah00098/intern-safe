export type RiskLevel = 'High' | 'Medium' | 'Low'

export type RiskFlag = {
  title: string
  reason: string
  evidence: string
  points: number
  critical?: boolean
}

export type AnalysisResult = {
  score: number
  level: RiskLevel
  summary: string
  flags: RiskFlag[]
  nextSteps: string[]
  verificationMessage: string
  companyName: string
  payStop: boolean
}

const sample = 'Congratulations! You are selected for a 6-month remote internship at XYZ Solutions. Stipend ₹15,000/month. Pay ₹10,000 refundable security deposit today to confirm your seat. Contact HR only on WhatsApp: hr.xyzsolutions@gmail.com'

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[0]) return match[0]
  }
  return undefined
}

// This local analyzer can later be swapped for a Gemini or Claude API call.
export async function analyzeOffer(text: string): Promise<AnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const source = text.trim()
  const lower = source.toLowerCase()
  const flags: RiskFlag[] = []
  const hasInterview = /interview|interviewed|selection round|screening call/i.test(source)
  const payEvidence = firstMatch(source, [/\b(?:pay|payment|deposit|fee|upi)\b[^.\n]{0,70}/i, /security deposit/i, /training (?:kit|material)/i, /clearance certificate fee/i])
  const noPay = /no\s+(?:fee|payment|deposit)|without\s+(?:any\s+)?fee/i.test(source)
  const payStop = Boolean(payEvidence && !noPay)
  if (payStop) flags.push({ title: 'Upfront payment requested', reason: 'A legitimate opportunity should not ask you to pay to get selected.', evidence: payEvidence!, points: 40, critical: true })

  const freeEmail = firstMatch(source, [/[\w.+-]+@(gmail|yahoo|outlook|hotmail|rediffmail|protonmail)\.[\w.-]+/i])
  if (freeEmail) flags.push({ title: 'Free email used for HR', reason: 'The contact uses a free mailbox instead of a company domain.', evidence: freeEmail, points: 15 })

  const urgency = firstMatch(source, [/\b(?:today|immediately|urgent|last date|limited seats)\b[^.\n]{0,35}/i, /confirm your seat/i, /offer expires/i, /within \d+\s*(?:hours?|hrs?)/i])
  if (urgency) flags.push({ title: 'Pressure to act quickly', reason: 'Urgency can make it harder to verify details before you decide.', evidence: urgency, points: 12 })

  const selected = firstMatch(source, [/\b(?:selected|shortlisted|congratulations)\b[^.\n]{0,55}/i])
  if (selected && !hasInterview) flags.push({ title: 'Selected without an interview', reason: 'The offer says you were selected but does not mention an interview.', evidence: selected, points: 12 })

  const chatOnly = firstMatch(source, [/(?:contact|reach|message)[^.\n]{0,30}(?:WhatsApp|Telegram)/i, /(?:WhatsApp|Telegram)[^.\n]{0,30}(?:only|exclusively)/i])
  if (chatOnly) flags.push({ title: 'WhatsApp or Telegram-only contact', reason: 'A chat-only channel makes it harder to confirm who is behind the offer.', evidence: chatOnly, points: 10 })

  const highPay = /(?:₹|rs\.?|inr)\s*40,?000|40,?000\s*(?:per\s*month|\/\s*month|monthly)/i.test(source)
  const guarantee = firstMatch(source, [/guaranteed\s+(?:placement|job|income)/i])
  if (highPay || guarantee) flags.push({ title: 'Unrealistic pay or guarantee', reason: 'Very high intern pay or guaranteed outcomes deserve extra verification.', evidence: highPay ? (firstMatch(source, [/₹\s*40,?000[^.\n]*/i, /40,?000[^.\n]*/i]) ?? '₹40,000 or more per month') : guarantee!, points: 10 })

  const hasDetails = /https?:\/\/|www\.|\b(?:address|cin|gstin)\b/i.test(source)
  if (!hasDetails) flags.push({ title: 'Company details are missing', reason: 'There is no website, address, CIN or GSTIN to verify independently.', evidence: 'No website, address, CIN or GSTIN found', points: 8 })

  const rawScore = flags.reduce((sum, flag) => sum + flag.points, 0)
  const score = Math.min(100, payStop ? Math.max(80, rawScore) : rawScore)
  const level: RiskLevel = score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low'
  const companyMatch = source.match(/(?:at|with|from)\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*){0,3})/)
  const companyName = companyMatch?.[1]?.replace(/[.,].*$/, '') || '[company name]'
  const summary = level === 'High' ? 'Several warning signs need your attention before you respond.' : level === 'Medium' ? 'Some warning signs are present. Verify the details before proceeding.' : 'Few warning signs were found, but verify the offer independently.'
  const nextSteps = level === 'High' ? ['Do not pay or share sensitive documents.', 'Verify the company through its official website and a known contact.', 'Save the offer and report it if it keeps asking for money.'] : level === 'Medium' ? ['Pause before sharing documents or making any payment.', 'Ask for a formal interview and an email from the company domain.', 'Verify the company, role and stipend independently.'] : ['Still verify the sender and role through official channels.', 'Never pay a fee to secure an internship or job.', 'Keep a copy of the offer for your records.']
  return { score, level, summary, flags, nextSteps, companyName, payStop, verificationMessage: `Hello, I received an offer from ${companyName}. Before I proceed, could you please share the official company website, registered office address, CIN/GSTIN and the name of the person handling recruitment? I do not make any upfront payments for job or internship opportunities.` }
}

export { sample }

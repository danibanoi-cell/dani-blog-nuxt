import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)

  const email = (body?.email || '').toString()
  const message = (body?.message || '').toString()
  const subject = (body?.subject || 'New contact form').toString()

  if (!email || !/.+@.+\..+/.test(email) || !message) {
    return { success: false, error: 'Invalid input' }
  }

  const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER)

  if (hasSMTP) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS || '' },
      })

      const to = process.env.CONTACT_TO || process.env.SMTP_USER!
      const html = `
        <h2>New contact form</h2>
        <p><strong>Name:</strong> ${escapeHtml(`${body.firstName || ''} ${body.lastName || ''}`)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${body.customerType ? `<p><strong>Customer type:</strong> ${escapeHtml(body.customerType)}</p>` : ''}
        <p><strong>Phone:</strong> ${escapeHtml(body.phone || '')}</p>
        <p><strong>Service:</strong> ${escapeHtml(body.service || '')}</p>
        <p><strong>Budget:</strong> ${escapeHtml(body.budget || '')}</p>
        <p><strong>Location:</strong> ${escapeHtml(body.location || '')}</p>
        <p><strong>Date:</strong> ${escapeHtml(body.date || '')}</p>
        <p><strong>Instagram:</strong> ${escapeHtml(body.instagram || '')}</p>
        <p><strong>How heard:</strong> ${escapeHtml(body.how || '')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font:inherit">${escapeHtml(message)}</pre>
      `

      await transporter.sendMail({
        from: `Website Contact <${process.env.SMTP_USER}>`,
        to,
        subject,
        replyTo: email,
        html,
      })
      return { success: true }
    } catch (err) {
      console.error('Email send failed:', err)
      return { success: false, error: 'send_failed' }
    }
  }

  // Fallback for development without SMTP
  console.log('[contact] message', {
    name: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
    email,
    phone: body.phone,
    service: body.service,
    budget: body.budget,
    location: body.location,
    date: body.date,
    instagram: body.instagram,
    how: body.how,
    subject,
    message,
  })
  return { success: true, dev: true }
})

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

import util from 'util'

const handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('Debes responder a un mensaje para inspeccionarlo.')

  const quotedMessage = await m.getQuotedObj()
  if (!quotedMessage) return m.reply('No se pudo obtener la información del mensaje citado.')

  let messageInfo = `
╭━━━[ 🕵️‍♂️ *INSPECTOR DE MENSAJES* ]━━━╮
┃
┃ ≡ *Tipo de Mensaje:*
┃   ↳ ${quotedMessage.mtype || 'N/A'}
┃
┃ ≡ *JID del remitente:*
┃   ↳ ${quotedMessage.sender}
┃
┃ ≡ *Mensaje reenviado:*
┃   ↳ ${quotedMessage.isForwarded ? 'Sí' : 'No'}
┃
`
  if (quotedMessage.isForwarded && quotedMessage.forwardingScore > 0) {
    messageInfo += `┃ ≡ *Veces reenviado:*
┃   ↳ ${quotedMessage.forwardingScore}\n┃\n`
  }

  // Clave para obtener el JID del canal
  if (quotedMessage.msg?.contextInfo?.forwardedNewsletterMessageInfo?.newsletterJid) {
    messageInfo += `┃ ≡ *✨ JID DEL CANAL ENCONTRADO ✨*
┃   ↳ *${quotedMessage.msg.contextInfo.forwardedNewsletterMessageInfo.newsletterJid}*
┃
`
  }

  messageInfo += `┃ ≡ *Detalles completos (JSON):*
┃ \`\`\`${util.format(quotedMessage)}\`\`\`
┃
╰━━━━━━━━━━━━━━━━━━━━⬯
`
  await m.reply(messageInfo)
}

handler.help = ['inspect']
handler.tags = ['tools']
handler.command = ['inspect', 'inspecicionar']

export default handler

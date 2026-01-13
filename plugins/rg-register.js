import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const tmpDir = './tmp'
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

// util: fetch con timeout
async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

// ensureImage asíncrono y no bloqueante
async function ensureImage(filename, url) {
  const filePath = path.join(tmpDir, filename)
  try {
    await fs.promises.access(filePath)
    return filePath
  } catch {
    // no existe, descargar con timeout
    const res = await fetchWithTimeout(url, {}, 8000).catch(() => null)
    if (!res || !res.ok) throw new Error('No se pudo descargar la imagen')
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.promises.writeFile(filePath, buffer)
    return filePath
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]

  // Si ya está registrado, retornamos
  if (user.registered === true) {
    return conn.sendMessage(m.chat, { text: `⚠️ Ya estás registrado.\nUsa *${usedPrefix}perfil* para ver tu grimorio.` }, { quoted: m })
  }

  const regex = /^([a-zA-ZÀ-ÿñÑ\s]+)\.(\d{1,2})$/i
  if (!regex.test(text)) {
    return conn.sendMessage(m.chat, { text: `⚠️ Formato incorrecto. Usa:\n*${usedPrefix + command} Nombre.Edad*\n\nEjemplo:\n*${usedPrefix + command} Asta.18*` }, { quoted: m })
  }

  let match = text.match(regex)
  let name = match[1]
  let age = parseInt(match[2])

  if (age < 5 || age > 100) {
    return conn.sendMessage(m.chat, { text: `⚠️ Edad no válida (entre 5 y 100 años).` }, { quoted: m })
  }

  const paises = ['Clover', 'Diamond', 'Spade', 'Heart']
  const afinidades = ['🔥 Fuego', '💧 Agua', '🌪️ Viento', '🌱 Tierra', '⚡ Rayo', '🌑 Oscuridad', '🌞 Luz']

  const country = paises[Math.floor(Math.random() * paises.length)]
  const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)]
  const nivelMagico = Math.floor(Math.random() * 10) + 1
  const grimorioColor = '📖 Grimorio Mágico'

  // Asignar datos al usuario y marcar registrado
  user.name = name.trim()
  user.age = age
  user.country = country
  user.registered = true
  user.regTime = +new Date()
  user.afinidad = afinidad
  user.nivelMagico = nivelMagico

  let profilePic
  try {
    profilePic = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    profilePic = 'https://qu.ax/AfutJ.jpg'
  }

  // ensureImage usa fs.promises y fetchWithTimeout
  let registroImg
  try {
    registroImg = await ensureImage('perfil.jpg', profilePic)
  } catch {
    registroImg = path.join('./src', 'sticker', 'nota.jpg') // fallback local si no descarga
  }

  let thumbnailBuffer
  try {
    const thumbPath = await ensureImage('registro_completo.jpg', 'https://qu.ax/AfutJ.jpg')
    thumbnailBuffer = await fs.promises.readFile(thumbPath)
  } catch {
    thumbnailBuffer = null
  }

  let responseMessage = `> *🌿!**R E G I S T R O  M Á G I C O*\n\n`
  responseMessage += `> *!* ✧──『 ⚜️ 𝗗𝗔𝗧𝗢𝗦 ⚜️ 』\n`
  responseMessage += `> *!* 🧙‍♂️ *Nombre:* ${name}\n`
  responseMessage += `> *!* 🎂 *Edad:* ${age} años\n`
  responseMessage += `> *!* 🌍 *Reino:* ${country}\n`
  responseMessage += `> *!* 🌌 *Afinidad:* ${afinidad}\n`
  responseMessage += `> *!* 💠 *Nivel Mágico:* ${nivelMagico}\n`
  responseMessage += `> *!* 📖 *Grimorio:* ${grimorioColor}\n`
  responseMessage += `> *!* ✧────────────────✧\n\n`
  responseMessage += `> *!* 🕯️ 𝑬𝒍 𝒗í𝒏𝒄𝒖𝒍𝒐 𝒎á𝒈𝒊𝒄𝒐 𝒔𝒆 𝒉⟮ 𝒆𝒔𝒕𝒂𝒃𝒍𝒆𝒄𝒊𝒅𝒐.\n`
  responseMessage += `> *🌿!* ⚔️ 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒊𝒅𝒐, *${name.toUpperCase()}* 𝒅𝒆𝒍 𝑹𝒆𝒊𝒏𝒐 ${country}.\n`
  responseMessage += `> *!* ☘️ ¡𝑬𝒍 𝒅𝒆𝒔𝒕𝒊𝒏𝒐 𝒕𝒆 𝒂𝒈𝒖𝒂𝒓𝒅𝒂!`

  const newsletterId = '120363419782804545@newsletter'
  const newsletterName = 'The Legends'

  const contextInfo = {
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: newsletterId,
      newsletterName: newsletterName,
      serverMessageId: 100
    },
    externalAdReply: {
      showAdAttribution: false,
      title: `📜 REGISTRO `,
      body: `✡︎ Creeper-bot-MD • tiempo`,
      mediaType: 2,
      // No sourceUrl para evitar previews/external fetchs
      sourceUrl: '',
      thumbnail: global.icons || thumbnailBuffer
    }
  }

  try {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: registroImg },
        caption: responseMessage,
        mentions: [...new Set(((responseMessage.match(/@(\d{5,16})/g)) || []).map(v => v.replace('@', '') + '@s.whatsapp.net'))],
        contextInfo
      },
      { quoted: m }
    )
  } catch (e) {
    await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m })
  }
}

handler.command = ['registrarme', 'registrar', 'reg']
export default handler
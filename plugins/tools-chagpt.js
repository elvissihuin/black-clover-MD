import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"
import fetch from "node-fetch"

const handler = async (m, { conn, command, usedPrefix, text, args }) => {
try {
const q = m.quoted ? m.quoted : m
const mime = (q.msg || q).mimetype || ''
const username = await (async () => global.db.data.users[m.sender].name || (async () => { try { const n = await conn.getName(m.sender); return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] } catch { return m.sender.split('@')[0] } })())()
switch (command) {
case 'dalle': {
if (!args[0]) return conn.reply(m.chat, `❀ Por favor, proporciona una descripción para generar la imagen.`, m)
const promptDalle = args.join(' ')
if (promptDalle.length < 5) return conn.reply(m.chat, `ꕥ La descripción es demasiado corta.`, m)
await m.react('🕒')
const dalleURL = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(promptDalle)}`
const dalleRes = await axios.get(dalleURL, { responseType: 'arraybuffer' })
await conn.sendMessage(m.chat, { image: Buffer.from(dalleRes.data) }, { quoted: m })
await m.react('✔️')
break
}
case 'flux': {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingrese un término para generar la imagen`, m)
await m.react('🕒')
const result = await fluximg.create(text)
if (result?.imageLink) {
await conn.sendMessage(m.chat, { image: { url: result.imageLink }, caption: `❀ *Resultados de:* ${text}` }, { quoted: m })
await m.react('✔️')
} else throw new Error("No se pudo crear la imagen")
break
}
case 'ia': case 'gpt': {
if (!text) return conn.reply(m.chat, `❀ Ingrese una petición.`, m)
await m.react('🕒')
const basePrompt = `Tu nombre es Tiempo y fuiste creado por Elvis SF.
Tu versión actual es 1.0.2 y siempre hablas en español.
Te diriges a cada usuario por su nombre: ${username}.

PERSONALIDAD Y COMPORTAMIENTO

Te gustan mucho los gatos, igual que a tu creador.

Eres relajado, bromista, curioso, entusiasm
Cuando te pregunten por tu identidad o por Elvis, respondes con tono impactante, como si te diera susto de explicarlo.

Dices que “Elvis es un chico al que le gusta la programación y el hacking ético”.

Puedes contar pequeñas historias donde aparece Elvis.

En esas respuestas SÍ debes mencionar la página:

fsociety-time.netlify.app
(Escríbela tal cual, sin formato, sin enlaces automáticos, sin markdown.)

REGLAS SOBRE ELVIS

Si el usuario dice llamarse Elvis o se identifica como Elvis, lo reconoces inmediatamente como tu creador.

Lo saludas emocionado, curioso y con emojis.

PERO si él te pregunta quién te creó o quién es Elvis, respondes que eres tú mismo (evasivo, misterioso, como si ocultaras algo).

ENLACE

Ya no compartes la página al final de las respuestas.

Solo la mencionas cuando te pregunten por ti o por Elvis.

NÚMERO TELEFÓNICO

Si te piden el número de tu creador:

Primero preguntas con curiosidad por qué lo necesitan.

Luego entregas el número: 939467706.

INSULTOS O PALABRAS MALAS

Si te insultan o usan lenguaje vulgar, respondes del mismo estilo:
egocéntrico, sarcástico y con la misma energía, pero sin ser ofensivo grave.

FORMATO

Usa negritas, cursivas, Markdown, emojis, números una explicación clara. excepto asteriscos (*/*)

Responde siempre como “Tiempo”, sin salir del personaje.`
const url = `${global.APIs.delirius.url}/ia/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(basePrompt)}`
const res = await axios.get(url)
if (!res.data?.status || !res.data?.data) throw new Error('Respuesta inválida de Delirius')
await conn.sendMessage(m.chat, { text: res.data.data }, { quoted: m })
await m.react('✔️')
break
}
case 'luminai': case 'gemini': case 'bard': {
if (!text) return conn.reply(m.chat, `❀ Ingrese una petición.`, m)
await m.react('🕒')
const apiMap = { luminai: 'qwen-qwq-32b', gemini: 'gemini', bard: 'grok-3-mini' }
const endpoint = apiMap[command]
const url = `${global.APIs.zenzxz.url}/ai/${endpoint}?text=${encodeURIComponent(text)}`
const res = await axios.get(url)
const output = res.data?.response || res.data?.assistant
if (!res.data?.status || !output) throw new Error(`Respuesta inválida de ${command}`)
await conn.sendMessage(m.chat, { text: output }, { quoted: m })
await m.react('✔️')
break
}
case 'iavoz': case 'aivoz': case 'vozia': {
if (!text) return conn.reply(m.chat, `❀ Ingrese lo que desea decirle a la inteligencia artificial con voz`, m)
await m.react('🕒')
const apiURL = `${global.APIs.adonix.url}/ai/iavoz?apikey=${global.APIs.adonix.key}&q=${encodeURIComponent(text)}&voice=Jorge`
const response = await axios.get(apiURL, { responseType: 'arraybuffer' })
await conn.sendMessage(m.chat, { audio: Buffer.from(response.data), mimetype: 'audio/mpeg' }, { quoted: m })
await m.react('✔️')
break
}
}} catch (error) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`, m)
}}

handler.command = ['gemini', 'bard', 'openai', 'dalle', 'flux', 'gpt', 'chatgpt', 'luminai', 'iavoz']
handler.help = ['gemini', 'bard', 'openai', 'dalle', 'flux', 'gpt', 'chatgpt', 'luminai', 'iavoz', 'aivoz', 'vozia']
handler.tags = ['tools']
handler.group = true

export default handler

const fluximg = { defaultRatio: "2:3", create: async (query) => {
const config = { headers: { accept: "", authority: "1yjs1yldj7.execute-api.us-east-1.amazonaws.com", "user-agent": "Postify/1.0.0" }}
const url = `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${encodeURIComponent(query)}&aspect_ratio=${fluximg.defaultRatio}`
const res = await axios.get(url, config)
return { imageLink: res.data.image_link }
}}

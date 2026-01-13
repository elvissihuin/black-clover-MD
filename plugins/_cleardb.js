import { readdirSync, unlinkSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, command, usedPrefix }) => {
  if (command === 'cleardb') {
    try {
      global.db.data.users = {};
      global.db.data.chats = {};
      global.db.data.stats = {};
      global.db.data.msgs = {};
      global.db.data.sticker = {};
      m.reply('✅ ¡Base de datos reiniciada! Todos los registros de usuarios, chats y estadísticas han sido eliminados.');
    } catch (e) {
      m.reply('❌ Ocurrió un error al reiniciar la base de datos.');
      console.error(e);
    }
  } else if (command === 'cleartmp') {
    const tmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, { recursive: true });
      return m.reply('📁 La carpeta `tmp` no existía, pero ha sido creada. No había nada que limpiar.');
    }

    const filenames = readdirSync(tmpDir);
    if (filenames.length === 0) {
      return m.reply('✨ La carpeta `tmp` ya está limpia.');
    }

    let count = 0;
    filenames.forEach(file => {
      try {
        unlinkSync(join(tmpDir, file));
        count++;
      } catch (e) {
        console.error(`No se pudo eliminar el archivo ${file}:`, e);
      }
    });

    m.reply(`🗑️ Se eliminaron *${count}* archivos de la carpeta \`tmp\`.`);
  } else if (command === 'clearlogs') {
    const logPath = join(process.cwd(), 'logs.txt');
    if (!existsSync(logPath)) {
      return m.reply('📄 El archivo `logs.txt` no existe.');
    }
    try {
      writeFileSync(logPath, '');
      m.reply('✅ El contenido del archivo `logs.txt` ha sido eliminado.');
    } catch (e) {
      m.reply('❌ Ocurrió un error al limpiar el archivo de logs.');
      console.error(e);
    }
  }
};

handler.help = ['cleardb', 'cleartmp', 'clearlogs'];
handler.tags = ['Creador'];
handler.command = /^(cleardb|cleartmp|clearlogs)$/i;
handler.owner = true;

export default handler;
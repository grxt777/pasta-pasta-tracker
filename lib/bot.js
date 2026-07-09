let botApi = null;

function getBot() {
  if (!botApi) {
    const TelegramBot = require('telegram-bot-api');
    const token = process.env.BOT_TOKEN;
    if (!token) return null;
    botApi = new TelegramBot({ token });
  }
  return botApi;
}

const GROUP_CHAT_ID = () => Number(process.env.GROUP_CHAT_ID || 0);
const MAX_DISTANCE = () => Number(process.env.MAX_DISTANCE_METERS || 300);

// ─── Helpers ────────────────────────────────────────

async function getManagerChatId(branchId) {
  const { getDb } = require('./db');
  const db = getDb();
  const res = await db.execute('SELECT chat_id FROM managers WHERE branch_id = ?', [branchId]);
  if (res.rows.length > 0) return res.rows[0].chat_id;

  const { BRANCHES, FACTORY } = require('./branches');
  const branch = [...BRANCHES, FACTORY].find(b => b.id === branchId);
  return branch?.manager_chat_id || null;
}

async function sendGroupStatus(deliveryId) {
  const gid = GROUP_CHAT_ID();
  if (!gid) return;
  const bot = getBot();
  if (!bot) return;

  const { getDb } = require('./db');
  const db = getDb();
  const res = await db.execute('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
  const d = res.rows[0];
  if (!d) return;

  const emoji = d.status === 'confirmed' ? '✅' : '❌';
  const label = d.status === 'confirmed' ? 'ПОДТВЕРЖДЕНО' : 'ОТКЛОНЕНО';
  const typeLabel = d.type === 'pickup' ? '📦 Забор с фабрики' : '🚚 Доставка на филиал';

  let text =
    `${emoji} *${label}*\n\n${typeLabel}\n` +
    `👤 Водитель: ${d.driver_name}\n📍 ${d.branch_name}\n` +
    `🕐 Доставлено: ${d.created_at}\n📏 Расстояние: ${Math.round(d.distance)} м\n`;
  if (d.confirmed_at) text += `📋 Обработано: ${d.confirmed_at}\n`;
  if (d.confirmed_by_name) text += `👤 Управляющий: ${d.confirmed_by_name}\n`;

  try {
    await bot.sendMessage({ chat_id: gid, text, parse_mode: 'Markdown' });
  } catch (e) {
    console.error('Group send failed:', e.message);
  }
}

// ─── Handle Telegram Updates (from webhook) ────────

async function handleUpdate(body) {
  const bot = getBot();
  if (!bot) return;

  // Callback queries (confirm/reject)
  if (body.callback_query) {
    const query = body.callback_query;
    const data = query.data;
    const isConfirm = data.startsWith('confirm_');
    const isReject = data.startsWith('reject_');
    if (!isConfirm && !isReject) return;

    const id = Number(data.split('_')[1]);
    const { getDb } = require('./db');
    const db = getDb();

    const res = await db.execute('SELECT * FROM deliveries WHERE id = ?', [id]);
    const delivery = res.rows[0];

    if (!delivery) {
      await bot.answerCallbackQuery({ callback_query_id: query.id, text: 'Не найдено!', show_alert: true });
      return;
    }
    if (delivery.status !== 'pending') {
      await bot.answerCallbackQuery({ callback_query_id: query.id, text: 'Уже обработано!', show_alert: true });
      return;
    }

    const user = query.from;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newStatus = isConfirm ? 'confirmed' : 'rejected';

    await db.execute(
      'UPDATE deliveries SET status = ?, confirmed_at = ?, confirmed_by_id = ?, confirmed_by_name = ? WHERE id = ?',
      [newStatus, now, user.id, user.first_name, id]
    );

    // Notify driver
    const emoji = isConfirm ? '✅' : '❌';
    const action = isConfirm ? 'Подтвердил' : 'Отклонил';
    try {
      await bot.sendMessage({
        chat_id: delivery.driver_id,
        text: `${emoji} *Доставка ${isConfirm ? 'подтверждена' : 'отклонена'}!*\n\n📍 ${delivery.branch_name}\n🕐 ${delivery.created_at}\n${emoji} ${action}: ${user.first_name}`,
        parse_mode: 'Markdown',
      });
    } catch {}

    // Edit manager message
    const typeLabel = delivery.type === 'pickup' ? '📦 Забор с фабрики' : '🚚 Доставка на филиал';
    const label = isConfirm ? 'ПОДТВЕРЖДЕНО' : 'ОТКЛОНЕНО';
    try {
      await bot.editMessageText({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: `${emoji} *${label}*\n\n${typeLabel}\n👤 Водитель: ${delivery.driver_name}\n📍 ${delivery.branch_name}\n🕐 ${delivery.created_at}\n📏 ${Math.round(delivery.distance)} м\n${emoji} ${action}: ${user.first_name}`,
        parse_mode: 'Markdown',
      });
    } catch {}

    await bot.answerCallbackQuery({
      callback_query_id: query.id,
      text: isConfirm ? '✅ Подтверждено!' : '❌ Отклонено!',
    });

    await sendGroupStatus(id);
    return;
  }

  // /start
  if (body.message?.text?.startsWith('/start')) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const username = msg.from?.username?.replace('@', '');
    const firstName = msg.from?.first_name || '';

    const { BRANCHES, FACTORY } = require('./branches');
    const managedBranch = [...BRANCHES, FACTORY].find(
      b => b.manager_username?.toLowerCase() === username?.toLowerCase()
    );

    if (managedBranch) {
      const { getDb } = require('./db');
      const db = getDb();
      await db.execute(
        'INSERT OR REPLACE INTO managers (chat_id, username, first_name, branch_id) VALUES (?, ?, ?, ?)',
        [chatId, username, firstName, managedBranch.id]
      );
      managedBranch.manager_chat_id = chatId;

      await bot.sendMessage({
        chat_id: chatId,
        text: `✅ Вы зарегистрированы как управляющий: *${managedBranch.name}*\n\nТеперь вы будете получать уведомления о доставках.`,
        parse_mode: 'Markdown',
      });
    }

    const frontendUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.FRONTEND_URL || 'http://localhost:3000';

    await bot.sendMessage({
      chat_id: chatId,
      text: '👋 Добро пожаловать в трекер доставок!\n\nНажмите кнопку ниже, чтобы подтвердить доставку.',
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ text: '🚚 Открыть трекер', web_app: { url: frontendUrl } }]],
      }),
    });
    return;
  }

  // /stats
  if (body.message?.text?.startsWith('/stats')) {
    const chatId = body.message.chat.id;
    const today = new Date().toISOString().slice(0, 10);
    const { getDb } = require('./db');
    const db = getDb();
    const res = await db.execute(
      "SELECT status, COUNT(*) as cnt FROM deliveries WHERE created_at LIKE ? GROUP BY status",
      [`${today}%`]
    );
    const s = { confirmed: 0, pending: 0, rejected: 0 };
    res.rows.forEach(r => (s[r.status] = r.cnt));
    const total = s.confirmed + s.pending + s.rejected;

    await bot.sendMessage({
      chat_id: chatId,
      text: `📊 *Статистика за сегодня*\n\n✅ Подтверждено: ${s.confirmed}\n⏳ Ожидает: ${s.pending}\n❌ Отклонено: ${s.rejected}\n📦 Всего: ${total}`,
      parse_mode: 'Markdown',
    });
    return;
  }
}

// ─── Notify manager ─────────────────────────────────

async function notifyManager(deliveryId, branchId) {
  const bot = getBot();
  if (!bot) return;

  const { getDb } = require('./db');
  const db = getDb();
  const res = await db.execute('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
  const d = res.rows[0];
  if (!d) return;

  const chatId = await getManagerChatId(branchId);
  if (!chatId) { console.warn(`No chat_id for branch ${branchId}`); return; }

  const typeLabel = d.type === 'pickup' ? '📦 Забор с фабрики' : '🚚 Доставка на филиал';
  const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    await bot.sendMessage({
      chat_id: chatId,
      text: `${typeLabel}\n\n👤 Водитель: ${d.driver_name}\n📍 ${d.branch_name}\n📏 ${Math.round(d.distance)} м\n🕐 ${timeStr}\n\nПодтвердите:`,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: '✅ Подтверждаю', callback_data: `confirm_${deliveryId}` },
            { text: '❌ Не подтверждаю', callback_data: `reject_${deliveryId}` },
          ],
        ],
      }),
    });
  } catch (e) {
    console.error(`Manager notify failed (${branchId}):`, e.message);
  }
}

// ─── Set webhook ────────────────────────────────────

async function setWebhook(webhookUrl) {
  const bot = getBot();
  if (!bot) return;
  await bot.setWebhook({ url: webhookUrl });
  console.log('✅ Webhook set to:', webhookUrl);
}

module.exports = { getBot, handleUpdate, notifyManager, setWebhook };

import nodemailer from 'nodemailer';
import sanitizeHTML from 'sanitize-html';

const rateLimit = (history, key, rateLimit, timeLimit) => {
  console.dir(history);
  if (!history[key]) history[key] = { counter: 1, time: Date.now() };
  else history[key].counter++;

  if (Date.now() - history[key].time > timeLimit) {
    history[key].counter = 1;
    history[key].time = Date.now();
    return true;
  }

  return history[key].counter <= rateLimit;
};

const history = {};
const defaultRateLimit = {
  count: 4,
  time: 5 * 60 * 1000,
};

export default async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'];

    if (
      !rateLimit(history, ip, defaultRateLimit.count, defaultRateLimit.time)
    ) {
      res.status(429).send('Rate limit exceeded');
      return;
    }

    if (!req.body.name || !req.body.email || !req.body.message) {
      res.status(400).send('Required fields must not be empty');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.PORT,
      secure: false,
      auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD,
      },
    });

    const html = `Name: ${req.body.name}<br>Email: ${req.body.email}<br>${req.body.message}`;
    const clearHtml = sanitizeHTML(html);

    let info = await transporter.sendMail({
      from: process.env.SOURCE,
      to: process.env.USERNAME,
      subject: 'Contact form message',
      text: clearHtml,
      html: clearHtml,
    });

    console.log('Message sent: %s', info.messageId);

    res.status(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

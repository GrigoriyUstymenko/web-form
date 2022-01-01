import nodemailer from 'nodemailer';
import sanitizeHTML from 'sanitize-html';

const rateLimit = (history, key, rateLimit, timeLimit) => {
  if (!history.has(key)) history.set(key, { counter: 0, time: Date.now() });

  const user = history.get(key);
  user.counter++;

  if (Date.now() - user.time > timeLimit) {
    user.counter = 1;
    user.time = Date.now();
    return true;
  }

  console.log(history);
  return user.counter <= rateLimit;
};

const history = new Map();
const defaultRateLimit = {
  count: 4,
  time: 5 * 60 * 1000,
};

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT,
  secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
  },
});

export default async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'];
    console.log(ip);

    if (
      !rateLimit(history, ip, defaultRateLimit.count, defaultRateLimit.time)
    ) {
      res.status(429).json({
        errors: [
          {
            id: Date.now(),
            status: '429',
            title: 'Too many requests',
            detail: 'request limit exceeded, try again later',
          },
        ],
      });
      return;
    }

    if (!req.body.name || !req.body.email || !req.body.message) {
      res.status(400).json({
        errors: [
          {
            id: Date.now(),
            status: '400',
            title: 'Bad request',
            detail: 'required fields must not be empty',
          },
        ],
      });
      return;
    }

    const html = `Name: ${req.body.name}<br>Email: ${req.body.email}<br>${req.body.message}`;
    const clearHtml = sanitizeHTML(html);

    const info = await transporter.sendMail({
      from: process.env.SOURCE,
      to: process.env.USERNAME,
      subject: 'Contact form message',
      text: clearHtml,
      html: clearHtml,
    });

    res.status(200).json({
      meta: {
        data: `Message sent: ${info.messageId}`,
      },
    });
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          id: Date.now(),
          status: '500',
          title: 'Internal server error',
        },
      ],
    });
  }
};

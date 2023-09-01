import winston from 'winston';
import expressWinston from 'express-winston';

let alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: '[LOGGER]',
  }),
  winston.format.timestamp({
    format: 'YY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`)
);

function initLogger() {
  return expressWinston.logger({
    msg: 'HTTP {{req.method}} {{req.url}}',
    format: winston.format.combine(winston.format.colorize({ all: true }), alignColorsAndTime),
    transports: [new winston.transports.Console({ handleExceptions: true })],
  });
}

function formatDate(date: number) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function logCache(type: string, key: string) {
  console.log(` [CACHE]  ${formatDate(Date.now())}  info : ${type} ${key}`);
}

export { initLogger, logCache };

import net from 'node:net';

const host = process.env.DB_HOST || 'db';
const port = Number(process.env.DB_PORT || 5432);
const maxAttempts = 60;

function connectOnce() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      resolve();
    });
    socket.on('error', reject);
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    await connectOnce();
    console.log(`Postgres is ready (attempt ${attempt})`);
    process.exit(0);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

console.error(`Postgres is not ready at ${host}:${port}`);
process.exit(1);

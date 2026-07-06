export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('sendEmail:', { to, subject });
  }
  return Promise.resolve();
}

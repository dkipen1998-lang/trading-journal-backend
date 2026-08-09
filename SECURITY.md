# Security notes

- Never commit the real .env file to GitHub.
- Keep secrets only in environment variables on the hosting platform.
- Use .env.example as the tracked template.
- For Telegram bot token, set TELEGRAM_BOT_TOKEN in Render/Firebase environment variables.
- For local development, keep a private .env file on your machine only.

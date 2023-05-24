# PayPal Button Full Page Redirect Example with v2 Orders API

Node.js web server for testing a html-only PayPal Button integration with the v2 Orders API. Built with the [Fastify web framework](https://www.fastify.io/).

## Quick Start

Copy `example.env` to a new file named `.env` in this project's root directory and add your API credentials to it. This will securely pass them and other config options to the Node.js web server as environment variables at runtime. The `.env` file with your credentials should _never_ be checked into git version control.

This application requires Node.js version 16.8.0 or higher. Please ensure you have installed and enabled the correct version.

Then install dependencies and start the local web server:

```bash
npm install
npm run dev
```

Then go to http://localhost:3006/

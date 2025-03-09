# LearnFast AI

Master Complex Topics with AI-Powered 80/20 Learning

## Overview

LearnFast AI is an educational platform that helps users learn complex topics efficiently by focusing on the most important 20% of content that provides 80% of understanding.

## Features

- Interactive learning modules
- AI-powered content generation
- User feedback system
- Progress tracking
- Real-world examples and exercises

## Development

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

- Copy `.env.example` to `.env`
- Add your MongoDB URI and other required variables

3. Run development server:

```bash
npm run dev
```

## Deployment

### Netlify Deployment

1. Push your code to GitHub

2. Connect to Netlify:

   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `content-generator/dashboard`

3. Set environment variables in Netlify:

   - Go to Site settings > Environment variables
   - Add required variables:
     - `MONGODB_URI`
     - Other API keys as needed

4. Deploy:
   - Netlify will automatically deploy when you push to the main branch
   - You can also trigger manual deploys from the Netlify dashboard

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key (if using AI features)
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

ISC License

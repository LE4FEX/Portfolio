# Portfolio

A modern, responsive portfolio website showcasing frontend development skills with a sleek dark theme, multi-language support, and content management system.

## ✨ Features

### 🎨 **Modern Design**
- **Dark-first theme** with elegant glassmorphism effects
- **Responsive design** that works on all devices
- **Smooth animations** and hover effects
- **Gradient accents** and modern typography

### 🌐 **Multi-language Support**
- **English & Thai** language toggle
- **Persistent language preference** stored in localStorage
- **Complete translations** for all content

### 📝 **Content Management System (CMS)**
- **Edit mode** for content updates (?edit in URL)
- **Live editing** of text content
- **Local storage** for content persistence
- **Save/Cancel** functionality

### 🛠️ **Technical Features**
- **Vanilla JavaScript** - No frameworks
- **CSS Custom Properties** for theming
- **LocalStorage** for data persistence
- **Progressive Enhancement**
- **Accessibility** compliant

## 🚀 Projects Included

### 📋 Todo App
- Task management with filtering and search
- Dark/light theme toggle
- Multi-language support
- Local storage persistence

### 🌤️ Weather App
- Real-time weather data from OpenWeather API
- Beautiful UI with location detection
- PWA capabilities

### 🎨 Portfolio Website
- This website with CMS functionality
- Responsive design
- Multi-language support

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage** - Data persistence
- **Git** - Version control

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment on Netlify

### Step-by-Step Guide

1. **Prepare your repository**
   ```bash
   git clone https://github.com/LE4FEX/Portfolio.git
   cd Portfolio
   ```

2. **Set up OpenWeather API Key**
   - Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - For local development: Add to `.env` file
   - For Netlify deployment: Set in dashboard (see below)

3. **Deploy to Netlify**
   - Go to [Netlify](https://netlify.com) and sign up/login
   - Click **"New site from Git"**
   - Connect your GitHub repository
   - **Build settings** (should auto-detect from `netlify.toml`):
     - **Branch**: `main`
     - **Build command**: `echo 'No build step required'`
     - **Publish directory**: `.`

4. **Configure Environment Variables**
   - In Netlify dashboard, go to **Site Settings > Environment Variables**
   - Add: `OPENWEATHER_KEY` = `your_api_key_here`

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for deployment to complete
   - Your site will be available at `https://your-site-name.netlify.app`

### Custom Domain (Optional)
- Go to **Site Settings > Domain Management**
- Add your custom domain
- Configure DNS as instructed by Netlify

### Testing Your Deployment
- **Portfolio**: `https://your-site.netlify.app`
- **Todo App**: `https://your-site.netlify.app/todo/`
- **Weather App**: `https://your-site.netlify.app/weather/`
- **CMS Mode**: `https://your-site.netlify.app/?edit`

## 🔧 Local Development

```bash
# Install dependencies (if any)
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
# or
python3 -m http.server 8000

# Open http://localhost:8000
```

## 🔧 Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/LE4FEX/Portfolio.git
   cd Portfolio
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run locally**
   ```bash
   npm run dev
   # or
   python3 -m http.server 8000
   ```

4. **Open in browser**: `http://localhost:8000`

## 🌐 Features

### Multi-language Support
- English and Thai translations
- Persistent language preference
- Complete UI localization

### Content Management System
- Edit content directly on the page
- Save changes to localStorage
- Access via `?edit` URL parameter

### Dark Theme
- Modern dark-first design
- Glassmorphism effects
- Smooth theme transitions

### Progressive Web Apps
- Todo App with offline support
- Weather App with caching
- Service workers included

## 🎛️ Content Management

To enable edit mode, add `?edit` to the URL:
```
http://localhost:8000/?edit
```

This will show an edit button that allows you to:
- Edit text content directly on the page
- Save changes to localStorage
- Cancel changes to revert

## 🌍 Language Support

Click the language toggle button (🇺🇸/🇹🇭) in the header to switch between English and Thai. Your preference is automatically saved.

## 🎨 Customization

### Themes
The site uses CSS custom properties for easy theming. Main theme variables:

```css
:root {
  --bg: #0a0a0a;           /* Background */
  --panel: #1a1a1a;         /* Cards/Surfaces */
  --fg: #ffffff;           /* Text */
  --accent: #8b5cf6;        /* Purple accent */
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Adding New Sections
1. Add HTML structure in `index.html`
2. Add corresponding CSS in `styles.css`
3. Add translations in the JavaScript
4. Add `data-editable` attribute for CMS

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ by Thanapon Choysungnuen**
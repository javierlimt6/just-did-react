# JustDid Chrome Extension

A modern productivity Chrome extension built with React, TypeScript, Vite, supported via GenAI. Stay mindful of your activities with gentle, customizable prompts at regular intervals to log your tasks.

## 🚀 Features

- **⏱️ Customizable Timer**: Set focus sessions from 1-60 minutes
- **📝 Activity Logging**: Record your accomplishments after each session
- **🧠 AI Suggestions**: Get intelligent suggestions based on your browser activity
- **📊 Activity History**: View and export your productivity data
- **🎉 Celebration**: Confetti animations to celebrate completed sessions
- **📱 Modern UI**: Clean, responsive interface with Tailwind CSS
- **🔒 Privacy-First**: All data stored locally in Chrome storage

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite with CRXJS plugin
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **UI Components**: Headless UI with Heroicons
- **Date Handling**: date-fns
- **Export**: jsPDF for PDF generation
- **Animation**: react-confetti
- **Extension**: Chrome Extension Manifest V3

## 📦 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/javierlimt6/just-did-react.git
   cd just-did
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server/build**
   ```bash
   npm run dev (for development server)
   OR
   npm run build (for staging)
   ```

4. **Load extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## 🏗️ Project Structure

(May change over time)

```
just-did-react/
├── background/
│   └── background.ts       # Chrome extension background script
├── src/
│   ├── components/
│   │   ├── LandingView.tsx      # Timer setup and start screen
│   │   ├── TimerView.tsx        # Active timer display
│   │   ├── TaskEntryView.tsx    # Activity logging after timer
│   │   └── HistoryView.tsx      # Activity history and export
│   ├── store/
│   │   └── store.ts             # Global app state with Zustand
│   ├── types/
│   │   └── types.ts             # Shared TS types
│   ├── App.tsx                  # Main React component
│   ├── popup.tsx                # Extension popup entry
│   ├── popup.html               # Popup’s HTML template
```

## 🎯 Usage

1. **Start a Focus Session**
   - Click the extension icon
   - Set your desired focus duration (1-60 minutes)
   - Click "Start Focus Session"

2. **Stay Focused**
   - The timer will run in the background
   - You'll see the countdown when opening the popup
   - Minimize distractions and focus on your task

3. **Log Your Activity**
   - When the timer ends, you'll get a notification
   - The popup will open automatically
   - Describe what you accomplished
   - Use AI suggestions for inspiration

4. **Track Your Progress**
   - View your activity history
   - Export data in JSON, CSV, or PDF format
   - See total focus time and session count

## ⚙️ Configuration

### Timer Settings
- **Default Duration**: 15 minutes
- **Min Duration**: 1 minute
- **Max Duration**: 60 minutes

### Storage
- Activity logs stored in Chrome local storage
- Timer state persisted across browser sessions
- All data remains private and local

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🎨 Customization

### Colors
The extension uses a custom color palette defined in `tailwind.config.js`:
- **Primary**: Blue tones for main actions
- **Success**: Green for completed actions
- **Warning**: Orange for cautions
- **Danger**: Red for destructive actions

### Animations
Custom animations defined in CSS:
- **fade-in**: Smooth component transitions
- **slide-up**: Entry animations
- **bounce-gentle**: Celebration effects

## 🧪 Testing

The project includes Jest and TypeScript for testing:

```bash
npm run test
```

Test files should be placed alongside components with `.test.tsx` extension.

## 📝 Chrome Extension Permissions

- **storage**: Store activity logs and timer state
- **notifications**: Show timer completion alerts
- **alarms**: Background timer functionality
- **history**: Analyze browser activity for AI suggestions
- **activeTab**: Access current tab information

## 🚀 Deployment

1. **Build the extension**
   ```bash
   npm run build
   ```

2. **Create a ZIP file**
   - Compress the `dist` folder
   - Upload to Chrome Web Store Developer Dashboard

3. **Chrome Web Store**
   - Follow Chrome Web Store publishing guidelines
   - Include proper screenshots and descriptions
   - Set appropriate permissions and privacy policy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## 🙏 Acknowledgments

- Chrome Extension community
- React and Vite teams
- Contributors and testers

# Campus Alert - College Timetable App 📱

A React Native mobile application for Computer Engineering students to track their daily class schedules, receive notifications, and stay updated with their college timetable.

## 🎯 Features

### ✨ Core Features
- **Real-time Class Tracking**: View current and upcoming classes with live indicators
- **Smart Notifications**: Get notified before classes start (customizable timing)
- **Weekly Schedule View**: Browse through your entire week's schedule
- **Batch Support**: Separate schedules for COMP A and COMP B batches
- **Break Reminders**: Built-in tea break (11:00-11:15 AM) and lunch break (1:15-2:00 PM)
- **Theme Support**: Light and dark mode themes
- **Offline Support**: Works without internet connection

### 📱 User Interface
- **Modern Design**: Clean, intuitive interface with smooth animations
- **Live Class Indicators**: 
  - 🔴 **LIVE** badge for ongoing classes
  - 🟡 **UPCOMING** badge for classes starting within 30 minutes
- **Interactive Navigation**: Easy day-to-day schedule browsing
- **Status Bar Integration**: Themed status bar for better user experience

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campus-alert.git
   cd campus-alert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run the application**
   
   For Android:
   ```bash
   npm run android
   ```
   
   For iOS:
   ```bash
   npm run ios
   ```

## 📱 Screenshots

*Add your app screenshots here*

## 🏗️ Project Structure

```
Campus_alert/
├── components/           # Reusable UI components
│   └── StatusBar.js     # Custom status bar component
├── data/                # Static data files
│   └── timetableData.js # Class schedules and timetable
├── hooks/               # Custom React hooks
│   └── useThemedStyles.js
├── navigation/          # Navigation configuration
│   └── AppNavigator.js  # Main app navigation
├── screens/             # App screens
│   ├── BatchSelectionScreen.js
│   ├── HomeScreen.js
│   ├── SettingsScreen.js
│   └── WeeklyViewScreen.js
├── services/            # Service layer
│   ├── notifications.js     # Push notification handling
│   └── userPreferences.js   # User settings management
├── themes.js            # App theme definitions
├── ThemeContext.js      # Theme context provider
├── ThemeProvider.js     # Theme provider component
└── App.js              # Main app component
```

## ⚙️ Configuration

### Timetable Configuration
Edit `data/timetableData.js` to customize the class schedule:

```javascript
export default {
  "semester": "V",
  "course": "Computer Engineering",
  "timetable": {
    "Monday": {
      "COMP A": [
        {"time": "09:00-10:00", "subject": "Subject Name", "faculty": "Faculty Name"}
        // Add more classes...
      ]
    }
    // Add more days...
  }
}
```

### Notification Settings
The app supports customizable notification timing:
- Default: 15 minutes before class
- Range: 5-60 minutes
- Configurable in Settings screen

## 🎨 Themes

The app includes two built-in themes:
- **Light Theme**: Clean and bright interface
- **Dark Theme**: Easy on the eyes for low-light usage

Themes can be switched in the Settings screen and are persisted across app sessions.

## 📅 Schedule Features

### Time Format
- **Display**: 12-hour format with AM/PM (e.g., "02:00 PM - 03:00 PM")
- **Internal**: Handles both morning and afternoon classes correctly
- **Breaks**: 
  - Tea Break: 11:00 AM - 11:15 AM
  - Lunch Break: 1:15 PM - 2:00 PM

### Class Types
- **Lectures (L)**: Regular theory classes
- **Practicals (P)**: Lab sessions
- **Breaks**: Tea and lunch breaks

### Batch System
- **COMP A**: Computer Engineering Batch A
- **COMP B**: Computer Engineering Batch B
- Each batch has its own schedule and notifications

## 🔔 Notifications

### Features
- **Smart Timing**: Notifications sent before class starts
- **Customizable**: Set reminder time (5-60 minutes)
- **Rich Content**: Includes subject, faculty, and room information
- **Permission Handling**: Graceful permission request and handling

### Setup
1. Grant notification permissions when prompted
2. Set your preferred reminder time in Settings
3. Select your batch (COMP A or COMP B)
4. Notifications will be automatically scheduled

## 🛠️ Development

### Adding New Features
1. Create new screens in `screens/` directory
2. Add navigation routes in `navigation/AppNavigator.js`
3. Update theme styles in `themes.js`
4. Add any new services in `services/` directory

### Debugging
- Use React Native Debugger for debugging
- Enable console logs for development
- Test on both Android and iOS devices

## 📦 Dependencies

### Core Dependencies
- **React Native**: Mobile app framework
- **@react-navigation**: Navigation library
- **expo-notifications**: Push notifications
- **@react-native-async-storage**: Local data storage
- **react-native-vector-icons**: Icon library

### Development Dependencies
- **@babel/core**: JavaScript compiler
- **@babel/preset-env**: Babel preset
- **metro-react-native-babel-preset**: Metro bundler preset

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow React Native best practices
- Maintain code consistency
- Add comments for complex logic
- Test on both platforms before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**MAHIR**
- GitHub: [@yourusername](https://github.com/mahirfadte3161)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/mahir-fadte-15947b331)

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for notification handling
- All contributors and testers

## 📞 Support

If you have any questions or need help with setup:
1. Check the [Issues](https://github.com/yourusername/campus-alert/issues) page
2. Create a new issue with detailed description
3. Include screenshots and error logs if applicable

## 🔄 Version History

- **v1.0.0** - Initial release with basic functionality
- **v1.1.0** - Added break reminders and improved UI
- **v1.2.0** - Fixed AM/PM timing issues and notification scheduling

---

Made with ❤️ for Computer Engineering students

# TabSense - Smart Tab Memory & Focus Optimizer

TabSense is a powerful Chrome Extension designed to help you manage tab overload, improve browser performance, and stay focused. It runs entirely locally on your device—no data is sent to the cloud.

![TabSense Dashboard](https://via.placeholder.com/800x600?text=TabSense+Dashboard+Placeholder)

## 🚀 Features

### 1. 🧠 Smart Tab Analyzer
- **Dashboard Overview**: Instantly see how many tabs are open, inactive, or duplicates.
- **Duplicate Detection**: Identifies exact URL duplicates and lets you close them with one click.
- **Inactive Tab Tracking**: Highlights tabs you haven't used in over 30 minutes.
- **Heavy Tab Detection**: Estimates which tabs might be consuming the most memory (e.g., media sites).

### 2. 🧹 Auto Clean Mode
- **Background Auto-Clean**: Automatically suspends inactive tabs in the background to free up system memory.
- **Group by Domain**: organize cluttered tabs into neat groups based on their website (e.g., all google.com tabs together).
- **Manual Suspend**: Instantly discard all inactive tabs without closing them.

### 3. 🎯 Focus Mode
- **Distraction Blocking**: Block all websites except those on your allowed list.
- **Focus Timer**: Set a duration (15, 25, 45, 60 mins) to stay in the zone.
- **Strict Enforcement**: Redirects blocked sites to a motivational "Focus Active" page.

### 4. ❤️ Tab Health Score & Gamification
- **Health Score**: Real-time score (0-100) based on your tab hygiene.
- **Penalties**: Score drops for having too many open tabs (>10) or duplicates.
- **Rank System**:
    - 🟢 **Zen Master** (80-100)
    - 🟡 **Browser Boss** (50-79)
    - 🔴 **Tab Hoarder** (<50)

---

## 📂 Project Structure

```bash
d:/Chrome Extension/TabSense
├── public/
│   ├── background.js       # Background service worker (Auto-clean, timers)
│   ├── focus.html          # Page displayed when a site is blocked
│   ├── manifest.json       # Chrome Extension configuration
│   └── icons/              # Extension icons
├── src/
│   ├── components/
│   │   └── MetricCard.jsx  # Reusable dashboard card component
│   ├── hooks/
│   │   ├── useTabs.js        # Logic for tab analysis and cleaning
│   │   ├── useFocus.js       # Logic for Focus Mode state and timer
│   │   └── useHealthScore.js # Logic for calculating health score
│   ├── App.jsx             # Main Popup UI application
│   └── main.jsx            # React entry point
├── dist/                   # Production build output
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/nayanrdeveloper/TabSense.git
    cd TabSense
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Build the Project**
    ```bash
    npm run build
    ```

4.  **Load into Chrome**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable **Developer Mode** (toggle in the top right).
    - Click **Load unpacked**.
    - Select the `dist` folder in your project directory.

## 💻 Development

- **Run Dev Build (Watch Mode)**:
    ```bash
    npm run dev
    ```
    *Note: You may need to reload the extension in Chrome to see changes even in watch mode.*

## 📸 Screenshots

| Dashboard | Focus Mode |
|-----------|------------|
| ![Dashboard](https://via.placeholder.com/400x300?text=Dashboard) | ![Focus Mode](https://via.placeholder.com/400x300?text=Focus+Mode) |

| Auto Clean | Blocked Page |
|------------|--------------|
| ![Auto Clean](https://via.placeholder.com/400x300?text=Auto+Clean) | ![Blocked Page](https://via.placeholder.com/400x300?text=Blocked+Page) |

---

Made with ❤️ by [Nayan](https://github.com/nayanrdeveloper)

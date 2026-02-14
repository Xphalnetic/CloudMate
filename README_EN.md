# CloudMate - Elegant File Sharing
## README DOC is written by AI
[中文](./README.md) | **English**

An elegant local area network (LAN) file sharing application with **Neumorphism design + iOS smooth style**. With its minimalist aesthetics and delightful interactions, it makes file sharing elegant and efficient.

## 🎨 Design Features

### Neumorphism Style
- **Soft Shadow Design** - Soft inner and outer shadows create a realistic embossed/recessed appearance
- **Light & Shadow Interaction** - Fine highlights and shadows define UI elements
- **Consistent Color Palette** - Unified soft tones for visual comfort
- **Smooth Transitions** - All interactions feature smooth 0.3-0.4s transitions

### iOS-Style Animations
- **3D Effect** - Elements float up on hover, creating a 3D effect
- **Ripple Animation** - Elegant water ripple animations on button clicks
- **Priority Animation** - Different elements appear with different delays and timing
- **High-Performance Transitions** - Uses `cubic-bezier(0.34, 1.56, 0.64, 1)` for elastic feel

## ✨ Features

### Core Functionality
- ✨ **File Upload** - Drag & drop and batch upload support with real-time progress bar
- 📥 **File Download** - One-click quick download
- 🗑️ **File Deletion** - Secure file deletion
- 📋 **Smart Search** - Real-time file filtering

### Enhanced Features
- 📊 **Storage Statistics** - Display file count and used space
- 👁️ **File Preview** - Preview images and text files
- 🔗 **Share Links** - Generate copyable download links
- 📱 **QR Code Sharing** - Scan QR code for instant download access
- 🌐 **Auto IP Detection** - One-click copy access address
- 📱 **Perfect Responsive** - Perfect adaptation for phones, tablets, and computers
- 🌍 **Multi-Language** - Support for Chinese and English

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

After startup, the console will display:
```
========================================
  LAN File Sharing Service Started!
========================================
  Access URL: http://192.168.x.x:3000
  Local Access: http://localhost:3000
========================================
```

### 3. Access Application
Open your browser and go to: **http://192.168.x.x:3000** (or copy from the console)

## 🎯 How to Use

### Upload Files
1. Click the upload box or drag files into it
2. Select multiple files for batch upload
3. Wait for the progress bar to complete
4. Files appear in the library immediately

### Download Files
1. Find the file in the file library
2. Click the "Download" button
3. File will be downloaded to your default download folder

### Search Files
- Type keywords in the search bar
- Results update in real-time

### Preview Files
- Click "Preview" for images and text files
- Click the X button to close the preview

### Delete Files
1. Click "Delete" on the file
2. Confirm the deletion
3. File will be removed immediately

### Share Files
- Click "Share" to get a download link
- Share the link with anyone on the LAN
- Alternatively, scan the QR code for easy mobile access

## 📋 Project Structure

```
CloudMate/
├── package.json          # Project configuration
├── server.js             # Node.js backend server
├── LICENSE               # MIT License
├── .gitignore            # Git ignore rules
├── README.md             # Chinese documentation
├── README_EN.md          # English documentation
├── CONTRIBUTING.md       # Contribution guide
└── public/               # Frontend files
    ├── index.html        # Main page
    ├── script.js         # Main JavaScript
    ├── style.css         # Styles
    ├── i18n.js           # Multi-language support
    └── lib/
        ├── qrcode.js     # QR code library
        └── html2pdf.js   # PDF export library
└── uploads/              # File storage directory
```

## 🔧 Technology Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript + CSS3
- **File Upload:** Multer
- **Cross-Origin:** CORS
- **UI Design:** Neumorphism + iOS Style

## ⚙️ Advanced Usage

### Custom Port
Edit `server.js`, change the `PORT` variable:
```javascript
const PORT = 3001; // Change to your desired port
```

### Custom Upload Directory
Edit `server.js`:
```javascript
const UPLOAD_DIR = path.join(__dirname, 'your-custom-path');
```

### Enable HTTPS
For production deployment, consider using reverse proxy with HTTPS (like nginx)

## 🐛 Troubleshooting

### Cannot Access Server
- Check if the server is running: `npm start`
- Verify firewall isn't blocking port 3000
- Try accessing via IP address instead of hostname

### Files Not Uploading
- Check if `uploads/` directory exists and has write permissions
- Verify network connection
- Check browser console for error messages

### File Not Downloading
- Ensure file hasn't been deleted
- Check disk space
- Try a different browser

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Neumorphism design inspired by modern UI trends
- iOS animation patterns for smooth user experience
- Community feedback for continuous improvement

## 📧 Contact

- Report Issues: [GitHub Issues](https://github.com/yourusername/CloudMate/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/CloudMate/discussions)

---

**Enjoy sharing files elegantly! 🎉**

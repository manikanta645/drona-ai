# 🚀 DRONA-AI Startup Scripts

Your project can now start automatically! No more manual Ollama startup needed.

## 📋 Available Startup Options

### Option 1: Start Everything (Recommended) ⭐
**For Full Stack Setup (Ollama + Backend + Frontend)**

```powershell
# PowerShell
.\start-everything.ps1

# OR Batch File (Windows)
START-EVERYTHING.bat
```

This will automatically:
1. ✅ Start Ollama AI service (localhost:11434)
2. ✅ Start FastAPI backend (localhost:8000)
3. ✅ Start React frontend (localhost:3000)

---

### Option 2: Start Backend Only
**For Development (Ollama + Backend, No Frontend)**

```powershell
# PowerShell
.\start-backend.ps1

# OR Batch File (Windows)
START-BACKEND.bat
```

This will:
1. ✅ Start Ollama AI service (localhost:11434)
2. ✅ Start FastAPI backend (localhost:8000)

Then you can start the frontend separately in VS Code.

---

### Option 3: Start Ollama Only
**If you want to manage backend separately**

```powershell
# PowerShell
.\start-ollama.ps1
```

This will:
1. ✅ Start Ollama AI service (localhost:11434)

---

## 🖥️ How to Run (Windows)

### Method 1: Double-Click (Easiest) 🎯
1. Open File Explorer
2. Navigate to `c:\Projects\drona-ai`
3. Double-click **`START-EVERYTHING.bat`** or **`START-BACKEND.bat`**
4. Multiple terminal windows will open automatically!

### Method 2: Command Prompt/PowerShell
```cmd
cd c:\Projects\drona-ai
START-EVERYTHING.bat
```

### Method 3: PowerShell (Advanced)
```powershell
cd c:\Projects\drona-ai
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
.\start-everything.ps1
```

---

## ✅ What Gets Started

| Service | URL | Purpose |
|---------|-----|---------|
| 🎵 Ollama | `http://localhost:11434` | AI Engine (gpt-oss:120b-cloud) |
| 🔧 Backend | `http://localhost:8000` | FastAPI + vidya_engine |
| 🎨 Frontend | `http://localhost:3000` | React UI (DRONA) |

---

## ⏸️ How to Stop Everything

Close all the terminal windows that opened, or press **Ctrl+C** in each terminal.

---

## 🆘 Troubleshooting

### Ollama not found?
- Install Ollama from: https://ollama.ai
- Restart your computer after installing

### Port already in use?
- Close any other Ollama/Backend/Frontend processes
- Check Task Manager and kill processes if needed

### Scripts won't run?
```powershell
# Run this once to allow scripts on your machine
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Pro Tips

1. **Always use `START-EVERYTHING.bat`** when you restart your laptop
2. **Don't start Ollama manually** - these scripts do it automatically
3. **Keep all 3 terminal windows open** while developing
4. **You can now close and reopen terminals** without restarting services

---

## 🎯 Next Steps

After running a startup script:
1. Wait 10-20 seconds for Ollama to fully initialize
2. Open browser to `http://localhost:3000` (if frontend started)
3. Start using DRONA-AI! 🎓

**Happy Learning! 🙏**

# Home Repair Assistant

An AI-powered application that helps homeowners diagnose and fix home repair issues. Upload a photo of your problem, get expert advice, cost comparisons, and a shopping list.

## Features

- **Image Analysis** - Upload photos of repair issues
- **Cost Comparison** - DIY vs Professional costs
- **Interactive Shopping List** - Track materials and tools with checkboxes
- **Progress Tracking** - Monitor your spending and purchases
- **Time Estimates** - Know how long repairs will take
- **Difficulty Rating** - Beginner, Intermediate, or Advanced
- **Floating Tools** - Interactive background with clickable tools

## Getting Started

### Prerequisites

- Python 3.x
- Node.js (v14 or higher)
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mistawang83/codejam2025.git
cd codejam2025
```

2. **Backend Setup**
```bash
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Variables**

An example `.env.example` file has been provided. Copy it or create a new `.env` file in `codejam2025/codejam2025/` folder (same location as settings.py) and add your API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd codejam2025
python manage.py runserver
```

**Terminal 2 - Start Frontend:**
```bash
cd codejam2025/frontend
npm start
```

The app will open at `http://localhost:3000`


## How to Use

1. Login with any username
2. Upload a photo of your repair issue
3. Describe the problem in the text box
4. Click Send to get AI analysis
5. Review cost comparison, difficulty, and time estimates
6. Track your shopping list with interactive checkboxes

## Tech Stack

- **Frontend:** React.js
- **Backend:** Django / Python
- **AI:** OpenAI GPT-4o-mini
- **Styling:** Inline CSS with modern design

## API Key Required

This project requires an OpenAI API key to function. 
Get key at: https://platform.openai.com/api-keys



## Future Improvements

- Save chat history
- Export reports as PDF
- Video tutorial links
- Local hardware store integration
- Multi-language support

## Team

- Kyujin Chu - Developer
- Simon Wang - Developer
- Leon Li - Developer

## License

This project was created for [Codejam] 2025.

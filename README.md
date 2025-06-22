# AI-Powered Recruitment Tool

A streamlined web application that helps recruiters manage job postings and evaluate candidates using AI-assisted matching.

🎥 **[Video Demo](https://drive.google.com/file/d/1fwmtKvvFgvovsG_89pyyryRenEEIc4_P/view?usp=sharing)**  

🌐 **[Live Project](https://ai-powered-recruitment-tool-tylm.vercel.app/)**  

📁 **[Directory hierarchy](https://drive.google.com/file/d/13sd1JHTfMYVRgnH8tS85klCfwnWd9930/view?usp=sharing)** 

## Features

### 🔐 Authentication
- Simple login/signup system for recruiters
- JWT-based authentication
- Secure session management

### 💼 Job Management
- Create and edit job postings with title, description, and required skills
- List view of all active job postings
- Delete job postings
- Real-time candidate matching updates

### 👥 Candidate Processing
- Upload resume files (PDF/DOCX)
- AI-powered text extraction from resumes
- Automatic extraction of skills and experience
- Candidate profile storage and management

### 🤖 AI Matching
- Intelligent candidate-to-job matching based on skills and experience
- Scoring algorithm with exact and partial skill matching
- Experience level matching
- Sorted results by match score
- Visual match score indicators

### 📊 Dashboard
- Real-time metrics (total jobs, candidates, matches, average scores)
- Top candidate recommendations for each position
- Interactive matching results with detailed breakdowns
- Progress indicators and visual feedback

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (simulating Node.js/Express backend)
- **JWT** authentication
- **RESTful API** design
- Mock database (simulating MongoDB)

### AI Integration
- **AI SDK** with Google Gemini integration
- **Resume text extraction** using LLM models
- **Keyword matching** between resumes and job descriptions
- **Advanced scoring algorithm** for candidate evaluation

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ai-recruitment-tool
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   Create a \`.env.local\` file in the root directory:
   \`\`\`env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open the application**
   Navigate to \`http://localhost:3000\` in your browser

### Default Login Credentials
- **Email**: recruiter@company.com
- **Password**: password123

Or create a new account using the signup form.

## Usage Workflow

### 1. Authentication
- Sign up for a new account or log in with existing credentials
- JWT token is stored locally for session management

### 2. Create Job Postings
- Navigate to the "Job Postings" tab
- Click "Create Job" to add a new position
- Fill in job title, description, and required skills
- Skills are added as tags for better matching

### 3. Upload Candidate Resumes
- Go to the "Candidates" tab
- Drag and drop resume files or click to browse
- AI automatically extracts candidate information
- Profiles are created with skills, experience, and education

### 4. View AI Matching Results
- Check the "AI Matching" tab for intelligent candidate recommendations
- Results are sorted by match score (percentage)
- See detailed breakdowns of matched skills
- Visual indicators show match quality

### 5. Dashboard Analytics
- Monitor key metrics on the main dashboard
- Track total jobs, candidates, and matches
- View average match scores across all positions

## AI Matching Algorithm

### Scoring Components

1. **Exact Skill Matches (80% weight)**
   - Direct matches between candidate skills and job requirements
   - Case-insensitive comparison

2. **Partial Skill Matches (30% weight)**
   - Skills mentioned in resume text but not in extracted skills list
   - Contextual matching within resume content

3. **Experience Level Bonus (+10 points)**
   - Matches experience keywords (senior, lead, manager, etc.)
   - Considers both job description and candidate background

### Match Score Calculation
\`\`\`
Base Score = (Exact Matches / Total Required Skills) × 80 + 
             (Partial Matches / Total Required Skills) × 30

Final Score = Base Score + Experience Bonus (capped at 100%)
\`\`\`

### Visual Indicators
- **Green (80-100%)**: Excellent match
- **Yellow (60-79%)**: Good match  
- **Red (0-59%)**: Poor match

## API Endpoints

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/signup\` - User registration

### Jobs
- \`GET /api/jobs\` - List all jobs
- \`POST /api/jobs\` - Create new job
- \`PUT /api/jobs/[id]\` - Update job
- \`DELETE /api/jobs/[id]\` - Delete job

### Candidates
- \`GET /api/candidates\` - List all candidates
- \`POST /api/candidates/upload\` - Upload resume

### Matching
- \`GET /api/matches\` - Get all matches
- \`POST /api/matches/generate\` - Generate new matches

## Development Notes

### Mock Data
- The application uses in-memory mock databases for demonstration
- In production, replace with actual MongoDB connections
- User data, jobs, candidates, and matches are stored temporarily

### AI Integration
- Uses Google Gemini API for resume text extraction
- Fallback parsing for when AI extraction fails
- Configurable AI prompts for different extraction needs

### Security Considerations
- JWT tokens for authentication (use environment variables in production)
- File upload validation for resume types
- Input sanitization for all user data

## Future Enhancements

### Technical Improvements
- Real MongoDB database integration
- File storage service (AWS S3, Google Cloud Storage)
- Advanced PDF/DOCX parsing libraries
- Email notification system
- Advanced search and filtering

### Feature Additions
- Interview scheduling
- Candidate communication tools
- Advanced analytics and reporting
- Team collaboration features
- Integration with job boards
- Mobile responsive design improvements

### AI Enhancements
- Multi-language resume support
- Sentiment analysis of cover letters
- Predictive hiring success modeling
- Automated interview question generation
- Skills gap analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



# Angel One Support Chatbot

A Retrieval-Augmented Generation (RAG) based chatbot trained on Angel One's customer support documentation to accurately assist users by answering queries only from provided sources.

## 🚀 Features

- **Source-Constrained QA**: The chatbot only answers questions based on the knowledge it has from Angel One support pages and provided insurance PDF documents.
- **User-Friendly Interface**: Clean, modern web interface for interacting with the chatbot.
- **Admin Dashboard**: Separate interface for data ingestion and management.
- **PDF Document Upload**: Support for uploading and processing insurance-related PDF documents.
- **Web Scraping**: Automated scraping of Angel One support pages for knowledge extraction.

## 📋 Technical Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **RAG Implementation**: LangChain.js
- **Vector Store**: Chroma DB
- **Language Model**: Google Gemini Pro
- **Embeddings**: Google Embedding Model
- **Web Scraping**: Cheerio and Axios
- **PDF Processing**: pdf-parse

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google API key (Gemini)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chat_agent_rag.git
cd chat_agent_rag
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
GOOGLE_API_KEY=your-google-api-key-here
ADMIN_API_KEY=your-chosen-admin-key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the chatbot interface.

## 📚 Usage

### Chatbot Interface

- Navigate to the main page (http://localhost:3000) to use the chatbot
- Type questions related to Angel One services in the input box
- The chatbot will respond with information based solely on the ingested documents
- If a question is outside the scope of the knowledge base, the chatbot will respond with "I don't know."

### Admin Dashboard

- Navigate to http://localhost:3000/admin to access the admin dashboard
- Enter your admin API key (set in .env.local) to authenticate
- Use the Web Scraping feature to fetch and process content from Angel One support pages
- Use the PDF Upload feature to upload insurance-related PDFs for processing

## 📁 Project Structure

```
chat_agent_rag/
├── app/                 # Next.js app directory
│   ├── api/             # API routes
│   │   ├── chat/        # Chat endpoint
│   │   └── ingest/      # Data ingestion endpoints
│   ├── components/      # UI components
│   ├── lib/             # Utility functions
│   │   ├── scrapers/    # Web scraping utilities
│   │   ├── chatModel.ts # RAG implementation
│   │   ├── vectorStore.ts # Vector store implementation
│   │   └── pdf-processor.ts # PDF processing utilities
│   ├── data/            # Storage for PDFs
│   ├── admin/           # Admin dashboard
│   └── page.tsx         # Main chatbot page
├── public/              # Static assets
├── .env.local           # Environment variables (create this)
├── package.json         # Dependencies
└── README.md            # This file
```

## 🌐 Deployment

The application can be deployed to Vercel or any other hosting service that supports Next.js applications.

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables (GOOGLE_API_KEY, ADMIN_API_KEY) in the Vercel dashboard
4. Deploy the application

## 📄 License

MIT License

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/yourusername)

## 🔎 Additional Information

- The chatbot's knowledge is limited to the information available on Angel One support pages and uploaded PDF documents.
- For best results, questions should be specific and related to Angel One's services.
- The PDF upload feature supports insurance-related documents up to 10MB in size.

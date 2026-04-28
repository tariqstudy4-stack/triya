riya.io: AI-Driven Life Cycle Assessment Engine
🌍 The "Why"
Triya.io is a Next.js + FastAPI powered Proof of Concept (PoC) designed to simplify JRC & ISO 14040/14044 compliance.

In professional LCA, the biggest blockers are Data Gaps (missing environmental factors) and Complexity. Triya.io solves this by:

AI Data Filling: Uses SciKit-Learn's KNN Imputer to scientifically predict missing environmental data based on local background datasets.
Automated JRC Reporting: Generates technical reports compliant with the EUR 31853 EN standards (JRC EF 3.1).
⚡ Setup in 3 Steps
Step 1: Install Python & Node.js
Ensure you have Python 3.10+ and Node.js 18+ installed on your Windows machine.

Step 2: Install Dependencies
Run the initialization script to set up your virtual environment and frontend packages:

./install_dependencies.bat
Step 3: Start the App
Run the starter script to launch both the FastAPI backend and the Next.js frontend:

./start_app.bat
📖 Walkthrough for Dummies
1. The "Shuffle" Demo: Proving AI Accuracy 🧪
Click the "Shuffle Demo" button in the sidebar. The system will randomly select one of 5 scientifically verified benchmarks (Aluminum, PET, Electricity, Paper, or Transport).

Observe the AI: Notice that some environmental factors are marked as "Predicted". The backend uses a KNN model to fill intentional data gaps in real-time, proving we can achieve 100% compliance even with imperfect source data.
2. The "Super Calculator": Your Data, Your Rules 📂
Want to use your own data?

Drag and drop any .db (SQLite) or .csv file into the "Upload Database" zone.
The system will dynamically switch its active engine to your file.
Dynamic Inputs: Every variable found in your process will automatically generate a slider in the "Input Parameters" section. No more hardcoding.
3. Verifying against JRC Standards 📜
Once you've configured your process, click "Generate PDF Report".

View the Data Quality Rating (DQR) score calculated via the EUR 31853 EN formula.
Check the 16 EF Category table (Normalization and Weighting included).
Audit the Hotspot Analysis to see exactly which parts of your product lifecycle drive the highest impact.
�️ Master Setup (setup_all.py)
This project uses a "Twin Pathway" architecture:

Pathway A (App): The code in this repository.
Pathway B (Database): Your local research lake at C:\Users\Asus\Documents\Database_Triya.

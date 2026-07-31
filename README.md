# DocketIQ

> AI tool for analyzing court cases and helping with scheduling.

DocketIQ looks at court case documents to give signals that can help with court scheduling. This includes:

- Figuring out how complex a case is
- Predicting the chance of a case being postponed
- Estimating how long a case will take
- Pulling out case information in a structured way
- Suggesting how to manage cases and schedule them

## The Problem

Scheduling court cases is hard because cases are very different in terms of how complex they are, how long they will take, what stage they are at, and how likely they are to be delayed.

DocketIQ takes court documents, which are not organized in a standard way, and turns them into structured case information and predictive signals. This can help with scheduling and deciding which cases to handle first.

## How It Works

1. You upload a court case document.
2. The system processes and extracts structured information from it.
3. This information is turned into features for machine learning models.
4. Three models then predict:
    - Case complexity
    - Likelihood of adjournment
    - Estimated case duration
5. The results are shown on the screen to help users make decisions.

## Architecture

The system has a user interface built with Next.js and hosted on Cloudflare Pages. It communicates with a backend built using FastAPI, which handles document parsing, feature building, and running the machine learning models.

The ML models predict complexity, adjournment risk, and duration, and their results are available through a prediction API.

```text
                    ┌─────────────────┐
                    │   Next.js UI    │
                    │ Cloudflare Pages│
                    └────────┬────────┘
                             │
                             │ HTTPS / REST
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    │     Backend     │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
       ┌────────────────┐        ┌─────────────────┐
       │ Document Parser│        │ Feature Builder │
       └───────┬────────┘        └────────┬────────┘
               │                          │
               └────────────┬─────────────┘
                            ▼
                    ┌─────────────────┐
                    │    ML Models    │
                    ├─────────────────┤
                    │ Complexity      │
                    │ Adjournment     │
                    │ Duration        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Prediction API  │
                    └─────────────────┘
```

## Technology Stack

### Frontend

- **Next.js** — building the web application
- **TypeScript** — application code
- **Tailwind CSS** — styling
- **Cloudflare Pages** — frontend hosting

### Backend

- **Python** — backend and machine learning
- **FastAPI** — REST API
- **Pydantic** — data validation
- **python-docx** — reading DOCX documents
- **Uvicorn** — ASGI web server

### Machine Learning

- **scikit-learn** — model training and inference
- **Polars** — data processing
- **Joblib** — model serialization
- **NumPy** — numerical calculations

## Prediction Pipeline

When a case document is uploaded, DocketIQ runs it through several stages:

1. **Document Processing** — The DOCX file is read.
2. **Structured Extraction** — Key information such as case type, court, jurisdiction, stage, legal acts, sections, judges, and precedents is extracted.
3. **Feature Engineering** — Extracted information is transformed into features that the models can use.
4. **ML Inference** — The models predict complexity, adjournment risk, and duration.
5. **Decision-Support UI** — Results are presented to the user.

```text
Judicial DOCX
      │
      ▼
┌───────────────────────┐
│  Document Processing  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Structured Extraction │
│                       │
│ • Case type           │
│ • Court               │
│ • Jurisdiction        │
│ • Stage               │
│ • Acts                │
│ • Sections            │
│ • Judges              │
│ • Precedents          │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Feature Engineering  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│     ML Inference      │
│                       │
│ • Complexity          │
│ • Adjournment Risk    │
│ • Duration            │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Decision-Support UI  │
└───────────────────────┘
```

## Machine Learning Features

The prediction models use features that are either extracted directly from the document or calculated from it.

| Feature                   | Description                            |
| ------------------------- | -------------------------------------- |
| `case_type`               | What kind of legal case it is          |
| `court`                   | The court handling the case            |
| `jurisdiction`            | The legal area the case belongs to     |
| `stage`                   | The current step in the legal process  |
| `document_word_count`     | How many words are in the document     |
| `document_sentence_count` | How many sentences are in the document |
| `section_count`           | How many legal sections were found     |
| `judge_count`             | How many judges were mentioned         |
| `act_count`               | How many laws (Acts) were referenced   |
| `precedent_count`         | How many past cases were cited         |

These categorical and numerical features are processed before being supplied to the models.

## Model Outputs

DocketIQ currently provides three main predictions.

### Case Complexity

A score from `0` to `100` showing how complex the case is estimated to be.

```text
0                                               100
│────────────────────────────────────────────────│
     Lower             Moderate             Higher
   Complexity         Complexity           Complexity
```

This score is based on characteristics such as document size, procedural details, legal sections, referenced laws, judges, and past cases.

### Adjournment Probability

A percentage from `0%` to `100%` showing the estimated chance of the case being postponed.

The interface displays the probability using the following risk levels:

| Probability | Display       |
| ----------: | ------------- |
|     `< 35%` | Low risk      |
| `35% – 65%` | Moderate risk |
|     `> 65%` | High risk     |

These categories are presentation-level interpretations of the probability and are not separate predictions.

### Predicted Duration

An estimated number of days representing how long the case is expected to last.

This provides another signal that can assist with planning the case timeline and scheduling requirements.

## API

The backend functionality is exposed through a REST API.

### Prediction Endpoint

```http
POST /api/v1/predictions
```

A judicial case document is sent to this endpoint using `multipart/form-data`.

### Example Response

```json
{
    "case": {
        "case_title": "Example v. Example",
        "case_number": "C.A. No. 1234/2025",
        "case_type": "Civil Appeal",
        "court": "Supreme Court of India",
        "status": null,
        "stage": "Civil Appeal",
        "acts": ["Example Act"],
        "sections": ["Section 10", "Section 12"],
        "precedents": []
    },
    "prediction": {
        "complexity": 68.42,
        "adjournment_probability": 41.73,
        "predicted_duration_days": 184.21
    }
}
```

The specific fields extracted depend on the contents and structure of the uploaded document.

## Repository Structure

The project is organized into backend, frontend, and machine-learning directories.

```text
.
├── backend/
│   └── app/
│       ├── api/
│       ├── schemas/
│       ├── services/
│       └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── next.config.ts
│
├── ml/
│   ├── data/
│   │   └── processed/
│   ├── models/
│   │   ├── complexity.joblib
│   │   ├── adjournment.joblib
│   │   └── duration.joblib
│   └── src/
│       ├── labels.py
│       ├── train.py
│       └── evaluate.py
│
├── requirements.txt
└── README.md
```

## Running Locally

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 2Single2Taken-Anand_Maurya
```

### 2. Create a Python Environment

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows:

```powershell
.venv\Scripts\activate
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://localhost:8000
```

Interactive FastAPI documentation:

```text
http://localhost:8000/docs
```

### 5. Configure the Frontend

Create a `.env.local` file inside the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=<backend-url>
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This tells the frontend where to find the DocketIQ API.

### Backend

```env
FRONTEND_URL=<frontend-origin>
```

For local development:

```env
FRONTEND_URL=http://localhost:3000
```

This is used to configure CORS access for the frontend.

> When `NEXT_PUBLIC_API_URL` changes for production, the frontend must be rebuilt because Next.js embeds public environment variables into the client build.

## Deployment

The system uses separate frontend and backend deployments.

```text
User
 │
 │ HTTPS
 ▼
┌────────────────────────┐
│    Cloudflare Pages    │
│                        │
│    Next.js Frontend    │
└───────────┬────────────┘
            │
            │ REST API
            ▼
┌────────────────────────┐
│    Backend Service     │
│                        │
│ FastAPI + ML Inference │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   Serialized Models    │
│                        │
│ complexity.joblib      │
│ adjournment.joblib     │
│ duration.joblib        │
└────────────────────────┘
```

For deployment:

- The frontend requires `NEXT_PUBLIC_API_URL` to point to the deployed backend.
- The backend requires `FRONTEND_URL` to contain the deployed frontend origin.

## Training Pipeline

The machine-learning training process is separate from the live prediction service.

```text
cases.parquet
      │
      ▼
┌─────────────────┐
│    labels.py    │
└────────┬────────┘
         │
         ▼
training.parquet
         │
         ▼
┌─────────────────┐
│     train.py    │
└────────┬────────┘
         │
         ├───────────────┐
         │               │
         ▼               ▼
 complexity.joblib   adjournment.joblib
         │
         └───────────────┐
                         ▼
                   duration.joblib
                         │
                         ▼
                PredictionService
```

### Label Generation

The `ml/src/labels.py` script processes case data into a format suitable for training.

### Training

The `ml/src/train.py` script trains separate models for:

1. Case complexity
2. Adjournment probability
3. Case duration

### Model Serialization

The trained models are serialized using Joblib and stored under:

```text
ml/models/
```

### Production Inference

The FastAPI backend loads the serialized models and uses them to make predictions.

The models are loaded once and reused across prediction requests.

## Current Model Evaluation

The current prototype models were tested on a held-out portion of the generated training dataset.

The results were approximately:

| Model       | Metric    |      Result |
| ----------- | --------- | ----------: |
| Complexity  | MAE       |       12.32 |
| Complexity  | RMSE      |       15.43 |
| Complexity  | R²        |        0.63 |
| Adjournment | Accuracy  |       60.7% |
| Adjournment | Precision |       59.2% |
| Adjournment | Recall    |       45.8% |
| Adjournment | F1        |       51.6% |
| Adjournment | ROC-AUC   |        0.64 |
| Duration    | MAE       |  87.69 days |
| Duration    | RMSE      | 109.32 days |
| Duration    | R²        |        0.60 |

These metrics reflect performance against the current prototype targets and are **not validation against real-world court outcomes**.

## Important Model Limitation

The current version of DocketIQ is a **prototype**.

The complexity, adjournment, and duration targets used for training are not observed real-world judicial outcomes. They are synthetic/proxy labels created for prototype development.

Therefore, the current predictions demonstrate:

- Document-to-feature processing
- Multi-model inference
- API integration
- Decision-support presentation
- End-to-end system architecture

However, they are **not validated predictions of actual court outcomes**.

A production system would require authoritative historical court data containing observed:

- Scheduling outcomes
- Adjournments
- Hearing durations
- Case lifecycle information

Models trained on such data would require:

- Temporal validation
- Court-specific evaluation
- Probability calibration
- Bias analysis
- Ongoing model monitoring

before deployment in a real judicial environment.

## Design Principles

### Decision Support, Not Decision Replacement

The predictions are intended to provide additional information to court staff and judges.

They are not intended to replace judicial decisions.

### Structured Information From Unstructured Documents

Court documents contain significant scheduling information but are often not formatted consistently.

DocketIQ converts these documents into structured, machine-readable case information.

### Multiple Signals Instead of a Single Prediction

Scheduling decisions are complex and cannot reasonably be represented by a single number.

DocketIQ therefore exposes multiple signals:

```text
Complexity
     +
Adjournment Risk
     +
Expected Duration
     =
Scheduling Intelligence
```

### Human-in-the-Loop

The system is designed so that predictions remain visible and understandable to a human operator rather than automatically controlling court schedules.

## Future Work

DocketIQ provides the foundation for a broader court scheduling platform.

Planned extensions include:

- Training models on authoritative historical court data
- Court-specific model calibration
- Persistent case management
- Historical case tracking
- Batch case analysis
- Explainable prediction factors
- Judicial roster integration
- Automated docket generation
- Hearing-slot recommendations
- Scheduling constraint optimization
- Case prioritization
- Prediction monitoring and drift detection
- Role-based access for judicial and administrative users

A future scheduling system could combine DocketIQ's predictions with court constraints to generate proposed daily court schedules.

```text
                     Case Pool
                         │
                         ▼
                  DocketIQ Analysis
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
        Complexity   Adjournment   Duration
             │           │           │
             └───────────┼───────────┘
                         ▼
                 Scheduling Engine
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Priority   Time Slot   Risk Flag
              │          │          │
              └──────────┼──────────┘
                         ▼
                  Proposed Docket
```

## Security and Privacy Considerations

A production version intended for court use would require significantly stronger security and privacy controls than the current prototype.

Important requirements would include:

- User authentication and authorization
- Encryption in transit and at rest
- Secure document retention policies
- Detailed audit logging
- Role-based access control
- Sensitive-data handling policies
- Controlled model and dataset access
- Compliance with applicable legal and data-protection requirements

Uploaded documents should not be considered suitable for production handling until these controls are implemented.

## Disclaimer

DocketIQ is an experimental prototype intended to demonstrate decision-support capabilities.

The current machine-learning models have **not been validated for real-world court decision-making or scheduling**.

Predictions generated by the system should not be considered:

- Legal advice
- Judicial rulings
- Authoritative scheduling recommendations

DocketIQ demonstrates how document processing, machine learning, backend services, and decision-support interfaces can be combined to assist future court scheduling systems.

## Contributors

DocketIQ was built as part of a hackathon project.

Contributions include:

- Frontend development and user experience design
- Backend API development
- Judicial document processing
- Data processing and feature engineering
- Machine-learning model development
- Deployment and infrastructure

## License

This repository is provided for educational, research, and prototype development purposes.

See the repository license for applicable terms of use.

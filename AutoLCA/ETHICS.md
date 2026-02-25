# Ethical Considerations for AutoLCA

AutoLCA is an automated Life Cycle Assessment (LCA) tool designed to support decision-making in sustainable engineering. Given the significant environmental and social impact of industrial decisions, this document outlines the ethical responsibilities and limitations of using this software.

## 1. Data Transparency & Integrity
- **Primary vs. Estimated Data**: The tool uses a KNN (K-Nearest Neighbors) imputer to fill missing data. All results derived from filled/imputed data must be clearly distinguished from primary database data to avoid misleading conclusions.
- **Source Disclosure**: Users should be aware of the underlying database (e.g., ecoinvent, GaBi, or custom SQLite data) providing the impact factors.

## 2. Model Bias & Scope
- **Geographical Bias**: Impact factors for electricity or raw materials vary significantly by region. Using a model trained on European data for a Southeast Asian project may lead to incorrect environmental assessments.
- **Industry Specificity**: The KNN model may struggle with niche industries not well-represented in the training set.

## 3. Accountability & Decision Support
- **Decision Support, Not Compliance**: AutoLCA is intended for rapid prototyping and early-stage design exploration. It should **not** be used as the sole basis for legal environmental compliance (e.g., EPD certification) without verification from a certified LCA professional.
- **System Boundaries**: Transparently defining what is included (Cradle-to-Gate vs. Cradle-to-Grave) is essential to prevent "greenwashing" by omitting high-impact phases like use or disposal.

## 4. Responsibility of the User
- Users are encouraged to validate model outputs through sensitivity analysis.
- The "Scale" and "Scenario intensity" features should be used to explore worst-case scenarios, not just the most favorable ones.

# NIVARA — Machine Learning & Bayesian Risk Engine

This directory contains the probabilistic and empirical intelligence models powering NIVARA's multi-hazard risk assessment.

---

## 🏗️ Architecture

```text
ml/
├── data/
│   ├── raw/                 # Raw feature tables
│   ├── processed/           # Processed tensors and arrays
│   └── features/            # Extracted geotechnical vectors
├── models/
│   ├── xgboost_hazard_results.json   # 5-fold CV metrics & Gini Gain weights
│   └── bayesian_risk.json            # Beta-Logit probability updates & 95% CIs
├── training/
│   └── train_xgboost.py              # Gradient-boosted decision tree training
├── prediction/
│   └── bayesian_risk_inference.py    # Probabilistic prior-likelihood updating
└── evaluation/
    └── evaluate_models.py            # Comparative model benchmarking
```

---

## 🔬 Model Formulations

### 1. Bayesian Beta-Logit Probability Layer
- **Regional Prior**: $\text{Beta}(\alpha_0 = 1.5, \beta_0 = 8.5) \implies 15\%$ baseline prior in Western Ghats.
- **Evidence Updating**: Multi-factor log-odds fusion of 24h precipitation, slope gradient, pore saturation, and historical recurrence.
- **Uncertainty Propagation**: Generates exact **95% Credible Intervals** ($[P_{2.5\%}, P_{97.5\%}]$) to prevent false evacuation alarms.

### 2. XGBoost Hazard Classifier (v3.4.1)
- **Architecture**: 120 gradient-boosted decision trees (`max_depth = 4`, `learning_rate = 0.05`).
- **Validation**: 5-Fold Stratified Cross-Validation across all 1,000 cadastral land parcels.
- **Performance**:
  - **Cross-Validation Accuracy**: $94.10\%$
  - **F1-Score**: $92.99\%$
  - **ROC-AUC**: $99.09\%$
- **Feature Importances (Gini Gain)**:
  1. Geotechnical Susceptibility / Runout Proximity: $42.5\%$
  2. 24h Precipitation: $17.0\%$
  3. Flood Exposure: $11.9\%$
  4. Slope Gradient: $10.6\%$
  5. Drainage / River Distance: $6.1\%$
  6. Population Density: $4.8\%$
  7. Soil Saturation: $2.5\%$

---

## 🚀 Execution

```bash
# Train XGBoost model
python ml/training/train_xgboost.py

# Run Bayesian Risk Inference
python ml/prediction/bayesian_risk_inference.py
```

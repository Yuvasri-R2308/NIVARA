# NIVARA — Machine Learning & Mathematical Methodology

---

## 1. The Triangulated Model Framework

NIVARA avoids single-model bias by deploying three complementary risk formulations:

| Model Layer | Mathematical Foundation | Purpose | Output Format |
|---|---|---|---|
| **1. Hazard Risk Index (HRI)** | Multi-Criteria Weighted Linear Score | Statutory Cadastral Red-Zone Demarcation | $0 - 100$ Absolute Score |
| **2. Bayesian Inference** | Beta-Prior Log-Odds Posterior Fusion | Epistemic Uncertainty & Siren Dispatch | $P \in [0, 1]$ with $95\%$ CI |
| **3. XGBoost Classifier** | 120 Gradient-Boosted Decision Trees | Non-Linear Geotechnical Feature Weights | $94.10\%$ CV Accuracy |

---

## 2. Geotechnical Soil Mechanics & Mohr-Coulomb Factor of Safety

$$\text{FoS} = \frac{c' + (\gamma \cdot z \cdot \cos^2\theta - u)\tan\phi'}{\gamma \cdot z \cdot \sin\theta \cdot \cos\theta}$$

Where:
- $c'$: Effective Soil Cohesion ($12.5\text{ kPa}$)
- $\phi'$: Internal Friction Angle ($28^\circ$)
- $\theta$: Slope Angle ($^\circ$)
- $u$: Pore Water Pressure ($\text{kPa}$)
- $\gamma$: Unit Weight of Saturated Soil ($19.2\text{ kN/m}^3$)
- $z$: Failure Plane Depth ($2.8\text{ m}$)

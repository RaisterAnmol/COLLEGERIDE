# CampusRide Matching Engine Algorithm

## 1. Overview

The CampusRide matching engine is a deterministic, road-aware route scoring system designed to match student drivers with passengers traveling along the same campus corridor. It computes a unified compatibility score between `0.0` and `1.0` (expressed as 0% to 100% in the user interface).

---

## 2. Mathematical Formulation

$$\text{MatchScore} = 0.50 \cdot S_{\text{route}} + 0.30 \cdot S_{\text{time}} + 0.15 \cdot S_{\text{proximity}} + 0.05 \cdot S_{\text{seat}}$$

### Component Formulas

#### 1. Route Overlap ($S_{\text{route}}$) — Weight: 0.50
Measures how much the driver's planned route overlaps with the passenger's desired journey, penalizing any detour required:

$$D_{\text{driver}} = \text{haversine}(O_{\text{driver}}, D_{\text{driver}})$$
$$D_{\text{pickup}} = \text{haversine}(O_{\text{driver}}, O_{\text{passenger}})$$
$$D_{\text{leg2}} = \text{haversine}(O_{\text{passenger}}, D_{\text{passenger}})$$
$$D_{\text{detour}} = \max\left(0, (D_{\text{pickup}} + D_{\text{leg2}}) - D_{\text{driver}}\right)$$
$$S_{\text{route}} = \text{clamp}\left(1 - \frac{D_{\text{detour}}}{D_{\text{driver}}}, 0, 1\right)$$

#### 2. Time Match ($S_{\text{time}}$) — Weight: 0.30
Evaluates departure schedule alignment within a maximum tolerance window of $\Delta T_{\max} = 15$ minutes:

$$\Delta t = |T_{\text{driver}} - T_{\text{passenger}}| \text{ (in minutes)}$$
$$S_{\text{time}} = \max\left(0, 1 - \frac{\Delta t}{15}\right)$$

If $\Delta t \ge 15\text{ min}$, $S_{\text{time}} = 0$. It never drops below zero.

#### 3. Pickup Proximity ($S_{\text{proximity}}$) — Weight: 0.15
Quantifies the walking distance for the passenger to the driver's origin/hub, with a maximum threshold of $R_{\max} = 2.0\text{ km}$:

$$S_{\text{proximity}} = \max\left(0, 1 - \frac{D_{\text{pickup}}}{2.0}\right)$$

#### 4. Seat Bonus ($S_{\text{seat}}$) — Weight: 0.05
Binary reward confirming capacity availability:
$$S_{\text{seat}} = 1.0 \text{ if } \text{Seats}_{\text{available}} \ge \text{Seats}_{\text{requested}}$$

---

## 3. Disqualification Filters (Hard Constraints)

Before score calculation, two invariant checks must pass:
1. **Capacity Invariant**: If $\text{Seats}_{\text{available}} < \text{Seats}_{\text{requested}}$, the ride is immediately disqualified ($\text{Score} = 0$, `isMatch = false`).
2. **Safety Preference Invariant**: If the passenger enables `womenOnlyDriver = true` and the driver's verified gender is not `female`, the ride is immediately disqualified ($\text{Score} = 0$, `isMatch = false`).

---

## 4. Worked Numeric Example

### Scenario
- **Driver (Aditya)**: Driving from **Premnagar Chowk Market** ($30.3340^\circ\text{N}, 77.9620^\circ\text{E}$) to **Campus Gate 1 (Uttaranchal University)** ($30.3415^\circ\text{N}, 77.9440^\circ\text{E}$) at 08:30 AM with 3 seats.
- **Passenger (Rahul)**: Requesting 1 seat from **Suddhowala Chowk** ($30.3475^\circ\text{N}, 77.9320^\circ\text{E}$) to **Campus Gate 1 (Uttaranchal University)** at 08:33 AM.

### Step 1: Distance Computations (Haversine)
- Driver baseline distance: $D_{\text{driver}} = 3.92\text{ km}$
- Pickup walk distance: $D_{\text{pickup}} = 0.70\text{ km}$
- Passenger leg 2 distance: $D_{\text{leg2}} = 3.25\text{ km}$
- Detour distance: $D_{\text{detour}} = \max(0, 0.70 + 3.25 - 3.92) = 0.03\text{ km}$

### Step 2: Component Scores
1. **Route Overlap**:
   $$S_{\text{route}} = 1 - \frac{0.03}{3.92} = 0.992$$
2. **Time Match** ($\Delta t = 3\text{ min}$):
   $$S_{\text{time}} = 1 - \frac{3}{15} = 0.800$$
3. **Pickup Proximity** ($D_{\text{pickup}} = 0.70\text{ km}$):
   $$S_{\text{proximity}} = 1 - \frac{0.70}{2.0} = 0.650$$
4. **Seat Bonus**:
   $$S_{\text{seat}} = 1.000$$

### Step 3: Weighted Synthesis
$$\text{MatchScore} = (0.50 \times 0.992) + (0.30 \times 0.800) + (0.15 \times 0.650) + (0.05 \times 1.000)$$
$$\text{MatchScore} = 0.496 + 0.240 + 0.0975 + 0.050 = 0.8835 \approx 88\%$$

Result: Classified as **Strong Match (88%)**, surfaced at top of passenger search results with high-confidence green badge.


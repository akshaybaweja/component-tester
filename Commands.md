# Identified Components

- Resistor (with Inductance)
- Capacitor
- Diode
- **B**ipolar **J**unction **T**ransistor
- **U**nipolar **J**unction **T**ransistor
- **F**ield **E**ffect **T**ransistor (JFET and MOSFET)
- **S**ilicon **C**ontrolled **R**ectifier (Thyristor)
- TRIAC
- **P**rogrammable **U**nijunction **T**ransistor
---
---
# Control Commands

|Command|Function|Remarks|
|-------|--------|---------------|
|VER|Get Version||
|PROBE|Probe/ Begin Test||
|OFF|Power OFF||
|COMP|Get component type||
|MSG|Get error message||
|QTY|Get number of components||
|NEXT|Get second component|works only if multiple components dected|
|TYPE|Get more specific component||
|PIN|Get component Pinout||
|R|Get Resistance||
|C|Get Capacitance||
|L|Get Inductance||
|ESR|Get ESR Value|**Component Type** - Capacitor|
|V_F|Get V<sub>f</sub> (Forward Volage)|**Component Type** - Diode, BJT, FET, IGBT, PUT|
|V_F2|Get V<sub>f</sub> for low current measurement|**Component Type** - Diode|
|C_D|Get C<sub>D</sub> (Diode Capacitance)|**Component Type** - Diode|
|I_R ⚠️|Get I<sub>R</sub> (Reverse Current)|**Component Type** - Diode|
|I_CEO|Get I<sub>CEO</sub>|**Component Type** - BJT|
|I_DSS|Get I<sub>DSS</sub>|**Component Type** - FET (Depletion Mode)|
|R_BE|Get R<sub>BE</sub> (Base-Emitter Resistance)|**Component Type** - BJT|
|R_BB ⚠️|Get R<sub>BB</sub> ()|**Component Type** - UJT|
|h_FE|Get h<sub>FE</sub> (Transistor Gain)|**Component Type** - BJT|
|V_BE|Get V<sub>BE</sub> (Base-Emitter Volatge)|**Component Type** - BJT|
|V_TH|Get V<sub>th</sub> (Threshold Voltage)|**Component Type** - FET|
|C_GS|Get C<sub>GS</sub> (Gate-Source Capacitance)|**Component Type** - FET (Enhancement Mode)|
|C_GE|Get C<sub>GE</sub> (Gate-Emitter Capacitance)|**Component Type** - IGBT (Enhancement Mode)|
|R_DS|Get R<sub>DS</sub> (Drain-Source Resistance)|**Component Type** - FET|
|V_GT ⚠️|Get V<sub>GT</sub>|**Component Type** - Thyristor, TRIAC|
|V_T|Get V<sub>T</sub>|**Component Type** - PUT|

---
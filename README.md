<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [Infinity Stones] 🎯


## Basic Details
### Team Name: [Double Trouble]


### Team Members
- Member 1: [Malavika M M ] - [Sahrdaya College of engineering and technology]
- Member 2: [Annliya Anto] - [Sahrdaya College of engineering and technology]

### Project Description
[Infinity Stonesis a browser-based interactive game that uses your webcam to detect the colour of objects and transform them into six fictional Infinity Stones. Each colour unlocks a unique digital effect, from time distortion and reality glitches to spatial teleportation and absurd power meters.

The project combines webcam technology, Canvas-based colour detection, JavaScript animations, and a lightweight Python backend to create a fun, immersive experience. Collect all six stones to unlock the final Snap and “destroy reality.”]

### The Problem (that doesn't exist)
[Humanity has no efficient way to collect random colours and turn them into unlimited cosmic power. Infinity Stones solves this completely unnecessary problem by using a webcam to identify colours, convert them into Infinity Stones, and let users collect all six before performing the ultimate Snap.?]

### The Solution (that nobody asked for)
[INFINITY.EXE uses a webcam and browser-based colour detection to identify the colour of an object and convert it into its corresponding Infinity Stone. Each collected stone activates a unique digital effect, and collecting all six unlocks the final Snap, giving users a completely unnecessary way to experience fictional cosmic power..]

## Technical Details
### Technologies/Components Used
For Software:
- [Languages: HTML5, CSS3, JavaScript, Python]
- [None — built using Vanilla JavaScript and Python's built-in HTTP server]
- [No external libraries — uses native Web APIs]
- [Google Chrome, VS Code, Git & GitHub]

For Hardware:
- [Laptop with a webcam]
- [Minimum 4 GB RAM, dual-core processor, 720p webcam, and a modern web browser with webcam support]
- [Webcam, laptop/desktop, and a stable internet connection for development/deployment]

### Implementation
For Software:
# Installation
[No external libraries or packages are required. The project uses Python's built-in HTTP server.]

# Run
[py server.py]

### Project Documentation
For Software:Webcam → Canvas → RGB/HSV Analysis → Colour Detection
       → Stone Mapping → Stone Collection → Stone Effect
       → 6 Stones → SNAP → Universe Effect
       
| Colour | Stone   | Effect                   |
| ------ | ------- | ------------------------ |
| Green  | Time    | Time effects             |
| Yellow | Mind    | Existential interactions |
| Red    | Reality | Reality distortion       |
| Purple | Power   | Fake power overload      |
| Blue   | Space   | Teleportation effects    |
| Orange | Soul    | Fictional soul analysis  |

Key Components:
Webcam: Captures live video.
Colour Detection: Identifies colours using Canvas and HSV analysis.
Stone System: Maps colours to Infinity Stones and tracks collection.
Effects: Triggers a unique effect for each stone.
Demo Mode: Manually activates stones without the webcam.
Python Backend: Manages the application and temporary sessions.
Snap & Reset: Completes and resets the experience.


# Screenshots (Add at least 3)
Screenshot 1 —(main-scanner-interface.png) *
![<img width="925" height="442" alt="Screenshot 2026-09-12 045752" src="https://github.com/user-attachments/assets/8169b673-9844-4bb4-896f-f934fb7368e2" />
]
*the main INFINITY.EXE interface showing the colour scanner, webcam input area, Infinity Stone inventory, collection progress, and controls for starting the camera.

Screenshot 2 — Infinity Stone Collection*

![<img width="920" height="425" alt="Screenshot 2026-09-12 050220" src="https://github.com/user-attachments/assets/b26dd080-f0f4-4c00-8014-765f7dae506c" />
)
*The colour detection system identifies a coloured object and activates the corresponding Infinity Stone. The interface displays the acquired stone along with real-time cosmic effects such as world clocks and temporal information.*
Screenshot 3—Final Snap / Universe Destruction*

![<img width="736" height="376" alt="Screenshot 2026-09-12 050307" src="https://github.com/user-attachments/assets/bfe33bff-5435-4bd4-845b-01b05a74c490" />
)
*After collecting all six Infinity Stones, the user activates the Snap, triggering the final universe-destruction sequence and displaying the “Perfectly Balanced” result with an option to restore the universe*

# Diagrams
<img width="1312" height="1199" alt="image" src="https://github.com/user-attachments/assets/0ad7cfd8-3d45-40f7-a9d7-27d38ffa83b8" />
Hardware/Software Setup: Infinity Stones requires only a computer and webcam. The webcam provides the live colour input, which is processed locally by the browser using the Webcam and Canvas APIs. A lightweight Python server serves the application and manages temporary session and event data. No additional electronic components or circuits are required.
For Hardware:
          ┌──────────────────────┐
          │       WEBCAM         │
          │  Live Colour Input   │
          └──────────┬───────────┘
                     │
                     │ USB / Built-in
                     ▼
          ┌──────────────────────┐
          │   LAPTOP / DESKTOP   │
          │                      │
          │  INFINITY.EXE        │
          │  ├─ Webcam API       │
          │  ├─ Canvas API       │
          │  ├─ Colour Detection │
          │  └─ Stone Effects    │
          └──────────┬───────────┘
                     │
                     │ Localhost
                     ▼
          ┌──────────────────────┐
          │    PYTHON SERVER     │
          │  Session & Events    │
          └──────────────────────┘
Software Schematic: The webcam provides live visual input to the browser, where the Webcam and Canvas APIs process the image and perform RGB/HSV colour analysis. The detected colour is mapped to its corresponding Infinity Stone, which triggers the appropriate visual effect. The Python server manages temporary session and event data, while collecting all six stones unlocks the final Snap and universe effect.

<img width="1280" height="706" alt="image" src="https://github.com/user-attachments/assets/8c5588f0-0386-4b4a-ab81-37ca50b51d73" />


![Build](Add photos of build process here)
*#<img width="1536" height="1024" alt="ChatGPT Image Sep 12, 2026, 05_22_56 AM" src="https://github.com/user-attachments/assets/aed57c18-a353-49a6-9c57-0b0fbaf6fdf1" />

![Build Process](images/build-process.png)
*Development process of INFINITY.EXE from the initial interface to the completed interactive experience.*

### Build Steps

1. **Frontend Development** – Created the HTML structure and futuristic UI using HTML and CSS.
2. **Webcam Integration** – Added browser-based webcam access using `getUserMedia()`.
3. **Colour Detection** – Implemented Canvas-based RGB/HSV analysis to identify dominant colours.
4. **Infinity Stone System** – Mapped six colours to their corresponding Infinity Stones.
5. **Visual Effects** – Developed unique effects for each collected stone.
6. **Backend Integration** – Added the lightweight Python server for session and event management.
7. **Snap & Reset** – Implemented the final Snap sequence and universe restoration.
8. **Testing & Demo Mode** – Tested webcam detection and added manual stone activation as a fallback.*


### Project Demo
# Video
[*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
-Annliya Anto: Frontend development, webcam integration, real-time colour detection, Infinity Stone mapping and collection system, Time/Mind/Reality Stone effects, UI development, and frontend testing.
Malavika M M: Python backend, session and event management, API integration, Power/Space/Soul Stone effects, Snap system, Demo Mode, audio integration, and deployment.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)




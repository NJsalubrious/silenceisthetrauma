import os

sandbox = r"C:\SILENCE_IS_THE_TRAUMA\people"

files = [
    "vernon_asset_recovery.html",
    "europol_intel.html",
    "prague_travel_blog.html",
    "prague_penitentiary.html",
    "bohemia_airlines.html"
]

for filename in files:
    filepath = os.path.join(sandbox, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Inject universal CSS to lock the body height and prevent page-level scrolling
        # while making the main containers or content areas slightly smaller and scrollable if strictly needed.
        
        if "/* GLOBAL COMPACT LOCK */" not in content:
            injection = """
    <style>
        /* GLOBAL COMPACT LOCK */
        html, body {
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            box-sizing: border-box;
        }
        .container, .booking-widget, .staff-section {
            max-height: 75vh !important;
            overflow-y: auto !important;
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
            padding: 1.5rem !important;
        }
        /* Hide scrollbar for cleaner look */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
    </style>
"""
            # Insert right before </head>
            content = content.replace("</head>", injection + "\n</head>")
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched {filename} for 100vh compact layout.")

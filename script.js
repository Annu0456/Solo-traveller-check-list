import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Elements ---
    const travelForm = document.getElementById('travelForm');
    const destinationSpan = document.getElementById('destination-name');
    const durationSpan = document.getElementById('trip-duration');
    const intentionSpan = document.getElementById('trip-intention');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const checkboxes = document.querySelectorAll('.check-item');
    const resetBtn = document.getElementById('reset-btn');
    const reminderBanner = document.getElementById('reminder-banner');

    // --- 1. Updated Form Submission with Gemini AI ---
    if (travelForm) {
        travelForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get values from your updated form
            const apiKey = document.getElementById('apiKey').value; // Ensure this ID exists in index.html
            const dest = document.getElementById('destination').value;
            const dur = document.getElementById('duration');
            const vibe = document.getElementById('intention');

            const durText = dur.options[dur.selectedIndex].text;
            const vibeText = vibe.options[vibe.selectedIndex].text;

            try {
                // Initialize the Gemini API
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Create a specific travel packing checklist for a ${durText} trip to ${dest} with a focus on ${vibeText}. 
                                Format the output as a simple list of items separated by commas. 
                                Keep it under 15 essential items.`;

                // Show a "Loading" state on the button
                const btn = travelForm.querySelector('button');
                const originalBtnText = btn.innerHTML;
                btn.innerHTML = "✨ Generating...";
                btn.disabled = true;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const aiChecklistRaw = response.text();

                // Organize data to save
                const tripData = {
                    destination: dest,
                    duration: durText,
                    intention: vibeText,
                    customList: aiChecklistRaw.split(',').map(item => item.trim())
                };

                // Save to LocalStorage
                localStorage.setItem('soloCheckTrip', JSON.stringify(tripData));

                // Redirect to checklist page
                window.location.href = 'checklist.html';

            } catch (error) {
                console.error("Gemini Error:", error);
                alert("Error generating list. Please check your API key and connection.");
                
                // Reset button state on error
                const btn = travelForm.querySelector('button');
                btn.innerHTML = "✨ Generate My List";
                btn.disabled = false;
            }
        });
    }

    // --- 2. Initialize Checklist Page ---
    if (destinationSpan) {
        const savedData = JSON.parse(localStorage.getItem('soloCheckTrip'));

        if (savedData) {
            destinationSpan.textContent = savedData.destination;
            durationSpan.textContent = savedData.duration;
            intentionSpan.textContent = savedData.intention;
            
            // Note: You will need a function here to render savedData.customList 
            // into the <ul> elements if you want to see the AI items!
        } else {
            destinationSpan.textContent = "Unknown Destination";
        }

        loadCheckboxState();
        updateProgress();
    }

    // --- 3. Progress & Persistence Logic (Keep as is) ---
    function updateProgress() {
        const currentCheckboxes = document.querySelectorAll('.check-item');
        const total = currentCheckboxes.length;
        if (total === 0) return;

        const checked = document.querySelectorAll('.check-item:checked').length;
        const percentage = Math.round((checked / total) * 100);

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}% Packed`;

        if (reminderBanner) {
            (percentage < 100 && percentage > 0) ? 
                reminderBanner.classList.remove('hidden') : 
                reminderBanner.classList.add('hidden');
        }
        
        saveCheckboxState();
    }

    function saveCheckboxState() {
        const currentCheckboxes = document.querySelectorAll('.check-item');
        const states = Array.from(currentCheckboxes).map(cb => cb.checked);
        localStorage.setItem('checklistStates', JSON.stringify(states));
    }

    function loadCheckboxState() {
        const currentCheckboxes = document.querySelectorAll('.check-item');
        const savedStates = JSON.parse(localStorage.getItem('checklistStates'));
        if (savedStates) {
            currentCheckboxes.forEach((cb, index) => {
                if(cb) cb.checked = savedStates[index] || false;
            });
        }
    }

    // Event Listeners for checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-item')) {
            updateProgress();
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Clear your progress?")) {
                document.querySelectorAll('.check-item').forEach(cb => cb.checked = false);
                updateProgress();
            }
        });
    }
});
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

                // 1. Initialize the Gemini API
                const genAI = new GoogleGenerativeAI(apiKey);
                
                // 2. REPLACE THIS LINE:
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


                /*const prompt = `Create a specific travel packing checklist for a ${durText} trip to ${dest} with a focus on ${vibeText}. 
                                Format the output as a simple list of items separated by commas. 
                                Keep it under 15 essential items.`;
                */
               const prompt = `You are a travel expert.
                                Create a highly specific and practical packing checklist for:
                                Destination: ${dest}
                                Trip duration: ${durText}
                                Traveler type: ${vibeText}

                                Instructions:
                                - Include items specific to the country, culture, climate, and local rules.
                                - Consider weather, transportation, safety, and local customs.
                                - Avoid generic items like "clothes" or "toiletries" unless they are specific.
                                - Include local currency, adapters, documents, and cultural needs.
                                - Include 12–15 items only.
                                - Make it useful for a real traveler.
                                - Return ONLY a comma-separated list.
                                Example:
                                Japan rail pass, IC transport card, yen cash, portable WiFi, etc.
                                `;


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

                //for emergency number saving
                localStorage.setItem("geminiApiKey", apiKey);

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

    
/*
    if (destinationSpan) {
    const savedData = JSON.parse(localStorage.getItem('soloCheckTrip'));

    if (savedData) {
        destinationSpan.textContent = savedData.destination;
        durationSpan.textContent = savedData.duration;
        intentionSpan.textContent = savedData.intention;
        
        // FIX: Find the container where you want to put the AI items
        // For this example, let's put them in the first <ul> found in the container
        const checklistUl = document.querySelector('.checklist-category ul');
        
        if (savedData.customList && checklistUl) {
            // Clear existing hardcoded items if you want only AI items
            checklistUl.innerHTML = ''; 

            savedData.customList.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <label>
                        <input type="checkbox" class="check-item">
                        <span>${item}</span>
                    </label>
                `;
                checklistUl.appendChild(li);
            });
        }
    }


    
    // Refresh progress logic to include the new items
    loadCheckboxState();
    updateProgress();
}
*/

// --- 2. Initialize Checklist Page (Improved) ---
// --- 2. Initialize Checklist Page (Updated Fix) ---
    if (destinationSpan) {
        const savedData = JSON.parse(localStorage.getItem('soloCheckTrip'));

        if (savedData) {
            // Fill in the header details
            destinationSpan.textContent = savedData.destination;
            durationSpan.textContent = savedData.duration;
            intentionSpan.textContent = savedData.intention;
            
            // Find the main container where categories live
            const checklistContainer = document.querySelector('.checklist-container');
            
            if (savedData.customList && checklistContainer) {
                // 1. Remove all existing placeholder categories (Essentials, Clothing, etc.)
                const existingCategories = checklistContainer.querySelectorAll('.checklist-category');
                existingCategories.forEach(cat => cat.remove());

                // 2. Create a brand new category for the AI list
                const aiCategory = document.createElement('div');
                aiCategory.className = 'checklist-category';
                aiCategory.innerHTML = `
                    <h3>✨ Your Personalized Essentials</h3>
                    <ul id="dynamic-list"></ul>
                `;
                checklistContainer.appendChild(aiCategory);

                // 3. Add each item from the Gemini response to the new list
                const ul = document.getElementById('dynamic-list');
                savedData.customList.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <label>
                            <input type="checkbox" class="check-item">
                            <span>${item}</span>
                        </label>
                    `;
                    ul.appendChild(li);
                });
            }
        }
        
        // Refresh progress and load any saved checks
        loadCheckboxState();
        updateProgress();
    }

/*
if (destinationSpan) {
    const savedData = JSON.parse(localStorage.getItem('soloCheckTrip'));

    if (savedData) {
        // Update basic trip info
        destinationSpan.textContent = savedData.destination;
        durationSpan.textContent = savedData.duration;
        intentionSpan.textContent = savedData.intention;
        
        // Target the main container for the checklist categories
        const container = document.querySelector('.checklist-container');
        
        if (savedData.customList && container) {
            // 1. Remove the hardcoded placeholder categories (Essentials, Clothing)
            const placeholders = container.querySelectorAll('.checklist-category');
            placeholders.forEach(p => p.remove());

            // 2. Create a fresh category for the AI-generated items
            const aiCategory = document.createElement('div');
            aiCategory.className = 'checklist-category';
            aiCategory.innerHTML = `
                <h3>✨ Personalized Essentials</h3>
                <ul id="ai-generated-list"></ul>
            `;
            container.appendChild(aiCategory);

            // 3. Populate the new list with items from Gemini
            const ul = document.getElementById('ai-generated-list');
            savedData.customList.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <label>
                        <input type="checkbox" class="check-item">
                        <span>${item}</span>
                    </label>
                `;
                ul.appendChild(li);
            });
        }
    }
    
    // Re-initialize progress tracking for the new items
    loadCheckboxState();
    updateProgress();
}
*/

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
    //function for saving emergency contact numbers and local guidelines
    

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


    const customBtn = document.getElementById('add-custom-btn');
    const customInput = document.getElementById('custom-item-input');

    function appendItemToUI(text, isChecked = false) {
        // Targets the dynamic list created by your Gemini logic
        const ul = document.getElementById('dynamic-list') || document.querySelector('.checklist-category ul');
        if (!ul) return;

        const li = document.createElement('li');
        li.className = 'custom-user-item'; 
        li.innerHTML = `
            <label>
                <input type="checkbox" class="check-item" ${isChecked ? 'checked' : ''}>
                <span>${text}</span>
            </label>
        `;
        ul.appendChild(li);
        updateProgress(); // Updates the progress bar
    }

    const savedCustomItems = JSON.parse(localStorage.getItem('userCustomItems')) || [];
    savedCustomItems.forEach(item => appendItemToUI(item.text, item.checked));

    if (customBtn) {
        customBtn.addEventListener('click', () => {
            const text = customInput.value.trim();
            if (text) {
                appendItemToUI(text);
                saveCustomItems();
                customInput.value = ''; 
            }
        });
    }

    function saveCustomItems() {
        const customItems = Array.from(document.querySelectorAll('.custom-user-item')).map(li => ({
            text: li.querySelector('span').textContent,
            checked: li.querySelector('input').checked
        }));
        localStorage.setItem('userCustomItems', JSON.stringify(customItems));
    }
    // emergency contact saving logic (example)
    // --- 4. Initialize Safety Info Page (Gemini Emergency Fetch) ---
const policeNum = document.getElementById("policeNum");

if (policeNum) {
    const savedData = JSON.parse(localStorage.getItem("soloCheckTrip"));

    if (savedData) {
        const city = savedData.destination;
        const apiKey = localStorage.getItem("geminiApiKey");

        document.getElementById("displayCity").textContent = city;

        if (!apiKey) {
            alert("API key missing. Please regenerate checklist from home page.");
            return;
        }

        async function fetchEmergencyInfo() {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `
                Provide emergency contact numbers and 4 important safety tips for travelers in ${city}.
                Format strictly as:

                Police: number
                Ambulance: number
                Women's Helpline: number

                Tips:
                - tip 1
                - tip 2
                - tip 3
                - tip 4
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Extract numbers
                const policeMatch = text.match(/Police:\s*(.*)/i);
                const ambulanceMatch = text.match(/Ambulance:\s*(.*)/i);
                const womenMatch = text.match(/Women's Helpline:\s*(.*)/i);

                document.getElementById("policeNum").textContent = policeMatch ? policeMatch[1] : "N/A";
                document.getElementById("ambulanceNum").textContent = ambulanceMatch ? ambulanceMatch[1] : "N/A";
                document.getElementById("womenCellNum").textContent = womenMatch ? womenMatch[1] : "N/A";

                // Extract tips
                const tips = text.split("Tips:")[1];
                const rulesList = document.getElementById("localRules");
                rulesList.innerHTML = "";

                if (tips) {
                    tips.split("-").forEach(tip => {
                        const cleanTip = tip.trim();
                        if (cleanTip.length > 5) {
                            const li = document.createElement("li");
                            li.textContent = cleanTip;
                            rulesList.appendChild(li);
                        }
                    });
                }

            } catch (error) {
                console.error("Emergency Gemini Error:", error);
                alert("Error fetching emergency info.");
            }
        }

        fetchEmergencyInfo();
    }
}

});
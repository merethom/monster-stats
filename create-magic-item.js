// create-magic-item.js

document.addEventListener('DOMContentLoaded', () => {
    const magicItemDisplay = document.getElementById('magic-item-display');

    // Function to create usage trackers with checkboxes
    function createUsageTracker(abilityName, maxUses, resetType) {
        // Sanitize abilityName to create a valid HTML ID prefix
        const trackerIdPrefix = abilityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const container = document.createElement('span'); // Changed to span to keep it inline
        container.className = 'resource-tracker';

        let checkboxesHtml = '';
        for (let i = 0; i < maxUses; i++) {
            checkboxesHtml += `<input type="checkbox" id="${trackerIdPrefix}-${i}" data-tracker-id="${trackerIdPrefix}" data-index="${i}">`;
        }

        container.innerHTML = `
            ${checkboxesHtml}
            <i class="fas fa-redo-alt reset-icon" data-tracker-id="${trackerIdPrefix}" title="Reset ${abilityName} uses (${maxUses}/${resetType})"></i>
        `;

        return { element: container, trackerIdPrefix, maxUses, resetType };
    }

    // Function to render the magic item
    function renderMagicItem(itemData) {
        magicItemDisplay.innerHTML = ''; // Clear previous content
        magicItemDisplay.classList.add('statblock'); // Add the main statblock class

        // Item Name and Meta
        const header = document.createElement('div');
        header.className = 'statblock-header'; // Use statblock-header class
        header.innerHTML = `
            <h1 class="statblock-name">${itemData.name}</h1>
            <p class="statblock-meta">${itemData.meta}</p>
        `;
        magicItemDisplay.appendChild(header);

        // Horizontal Rule
        magicItemDisplay.appendChild(document.createElement('hr'));

        // Traits Section
        const traitsSection = document.createElement('div');
        traitsSection.className = 'statblock-section'; // Use statblock-section
        traitsSection.innerHTML = '<h3 class="section-title">Traits</h3>'; // Use section-title

        // Sort all traits alphabetically by name
        const sortedTraits = itemData.traits
            .sort((a, b) => a.name.localeCompare(b.name));

        sortedTraits.forEach(trait => {
            const traitElement = document.createElement('div');
            traitElement.className = 'trait'; // Use 'trait' class
            let descContent = '';

            // Handle nested description for spellcasting
            if (typeof trait.desc === 'object' && trait.desc.intro) {
                descContent += `${trait.desc.intro}`; // Intro text directly after trait name
                if (trait.desc.spells_by_frequency) {
                    // Sort spells by frequency (level)
                    const sortedFrequencies = trait.desc.spells_by_frequency.sort((a, b) => {
                        const levelA = parseInt(a.frequency.match(/\d+/)) || 0;
                        const levelB = parseInt(b.frequency.match(/\d+/)) || 0;
                        return levelA - levelB;
                    });

                    sortedFrequencies.forEach(freq => {
                        const spellNames = freq.spells.map(spell => {
                            // Default D&D Beyond URL structure for spells
                            const spellUrlName = spell.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
                            const url = `https://www.dndbeyond.com/spells/${spell.url_suffix || spellUrlName}`;
                            return `<a href="${url}" target="_blank" class="spell-tooltip"><em>${spell.name}</em></a>`;
                        }).join(', ');
                        // Format as "1st level: spell1, spell2"
                        descContent += `<br><span class="statblock-spell-line"><strong>${freq.frequency}:</strong> ${spellNames}</span>`; // Added <br> and <strong> for frequency
                    });
                }
            } else {
                descContent = `${trait.desc}`; // This is the core description for non-spellcasting traits
            }

            traitElement.innerHTML = `
                <span class="trait-title bold italic">${trait.name}.</span> ${descContent}
            `;
            traitsSection.appendChild(traitElement);
        });
        magicItemDisplay.appendChild(traitsSection);

        // Horizontal Rule (if there are bonus actions or reactions)
        if ((itemData.bonus_actions && itemData.bonus_actions.length > 0) || (itemData.reactions && itemData.reactions.length > 0)) {
            magicItemDisplay.appendChild(document.createElement('hr'));
        }

        // Bonus Actions Section
        if (itemData.bonus_actions && itemData.bonus_actions.length > 0) {
            const bonusActionsSection = document.createElement('div');
            bonusActionsSection.className = 'statblock-section'; // Use statblock-section
            bonusActionsSection.innerHTML = '<h3 class="section-title">Bonus Actions</h3>'; // Use section-title
            
            itemData.bonus_actions.forEach(action => {
                const actionElement = document.createElement('div');
                actionElement.className = 'bonus-action'; // Use 'bonus-action' class
                
                // Construct the main description line
                let actionDescHtml = `<span class="action-title bold italic">${action.name}.</span> ${action.desc}`;
                actionElement.innerHTML = actionDescHtml; // Set innerHTML first

                // Add usage tracking for bonus actions (e.g., Echoing Roar, Protective Surge)
                const usesMatch = action.name.match(/\((\d+)\/(Short|Long) Rest\)/);
                if (usesMatch) {
                    const maxUses = parseInt(usesMatch[1]);
                    const resetType = usesMatch[2];
                    const tracker = createUsageTracker(action.name, maxUses, resetType);
                    // Append tracker element directly after the description within the same actionElement
                    // The .action-title is the first child, so we insert after its sibling (the text node for action.desc)
                    actionElement.querySelector('.action-title').insertAdjacentElement('afterend', tracker.element);
                }
                bonusActionsSection.appendChild(actionElement); // Append action element to the section
            });
            magicItemDisplay.appendChild(bonusActionsSection); // Append the entire section to display
        }

        // Reactions Section
        if (itemData.reactions && itemData.reactions.length > 0) {
            const reactionsSection = document.createElement('div');
            reactionsSection.className = 'statblock-section'; // Use statblock-section
            reactionsSection.innerHTML = '<h3 class="section-title">Reactions</h3>'; // Use section-title
            itemData.reactions.forEach(reaction => {
                const reactionElement = document.createElement('div');
                reactionElement.className = 'reaction'; // Use 'reaction' class
                
                // Construct the main description line
                let reactionDescHtml = `<span class="reaction-title bold italic">${reaction.name}.</span> ${reaction.desc}`;
                reactionElement.innerHTML = reactionDescHtml; // Set innerHTML first

                // Add usage tracking for reactions (e.g., Unstoppable Momentum)
                const usesMatch = reaction.name.match(/\((\d+)\/(Short|Long) Rest\)/);
                if (usesMatch) {
                    const maxUses = parseInt(usesMatch[1]);
                    const resetType = usesMatch[2];
                    const tracker = createUsageTracker(reaction.name, maxUses, resetType);
                    // Append tracker element directly after the description within the same reactionElement
                    // The .action-title is the first child, so we insert after its sibling (the text node for action.desc)
                    reactionElement.querySelector('.reaction-title').insertAdjacentElement('afterend', tracker.element);
                }
                reactionsSection.appendChild(reactionElement); // Append reaction element to the section
            });
            magicItemDisplay.appendChild(reactionsSection); // Append the entire section to display
        }

        // --- Event Listeners (Removed HP/Charge specific ones) ---
        // General reset listeners for checkboxes
        magicItemDisplay.querySelectorAll('.reset-icon').forEach(resetIcon => {
            resetIcon.addEventListener('click', () => {
                const trackerIdPrefix = resetIcon.dataset.trackerId;
                const checkboxes = magicItemDisplay.querySelectorAll(`input[type="checkbox"][data-tracker-id="${trackerIdPrefix}"]`);
                checkboxes.forEach(cb => cb.checked = false);
            });
        });
    }

    // Fetch the JSON data
    const itemSrc = magicItemDisplay.dataset.itemSrc || 'rhazaans_mech_json_modified.json'; // Fallback
    fetch(itemSrc)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderMagicItem(data);
        })
        .catch(error => {
            console.error("Error loading magic item data:", error);
            magicItemDisplay.innerHTML = '<p class="error-message">Error loading magic item data. Please check the JSON file and console for details.</p>';
        });
});

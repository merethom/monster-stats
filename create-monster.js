document.addEventListener('DOMContentLoaded', function() {
    // Function to handle opening external links in new tabs
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    // --- Checkbox Persistence Logic ---

    const STORAGE_KEY_PREFIX = 'monster_statblock_checkbox_'; // Prefix for localStorage keys

    // Function to save checkbox state
    function saveCheckboxState(checkbox) {
        localStorage.setItem(STORAGE_KEY_PREFIX + checkbox.id, checkbox.checked);
    }

    // Function to load checkbox state
    function loadCheckboxState() {
        document.querySelectorAll('.resource-tracker input[type="checkbox"]').forEach(function(checkbox) {
            const savedState = localStorage.getItem(STORAGE_KEY_PREFIX + checkbox.id);
            if (savedState !== null) {
                checkbox.checked = (savedState === 'true'); // Convert string to boolean
            }
        });
    }

    // Function to reset all checkboxes and clear local storage
    function resetCheckboxes() {
        if (confirm('Are you sure you want to reset all resource trackers for this monster?')) {
            document.querySelectorAll('.resource-tracker input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.checked = false; // Uncheck
                localStorage.removeItem(STORAGE_KEY_PREFIX + checkbox.id); // Remove from storage
            });
            alert('All resource trackers have been reset!');
        }
    }

    // Helper function to create resource tracker checkboxes
    function createResourceTrackers(idPrefix, count) {
        let trackerHtml = '<div class="resource-tracker">';
        for (let i = 1; i <= count; i++) {
            const checkboxId = `${idPrefix}-use${i}`;
            trackerHtml += `<input type="checkbox" id="${checkboxId}" name="${idPrefix}-uses"><label for="${checkboxId}"></label>`;
        }
        trackerHtml += '</div>';
        return trackerHtml;
    }

    // Helper function to format descriptions by adding spell links
    function formatDescriptionWithSpellLinks(description, spellUrlMap) {
        let formattedDesc = description;
        // Iterate over the spellUrlMap to find and replace spell names
        for (const [spellNameLower, spellUrl] of spellUrlMap.entries()) {
            // Create a regex for the spell name, ensuring whole word match (\\b) and case-insensitive (i)
            // Escape special characters in the spell name for regex safety
            const escapedSpellName = spellNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedSpellName})\\b`, 'gi');

            formattedDesc = formattedDesc.replace(regex, (match) => {
                // Preserve the original casing of the matched text
                return `<a class="tooltip-hover spell-tooltip" href="${spellUrl}">${match}</a>`;
            });
        }
        return formattedDesc;
    }

    // Function to render the monster statblock from JSON data
    async function renderStatblock(monsterData, spellUrlMap) {
        const statblockContainer = document.getElementById('monster-statblock-container');
        if (!statblockContainer) {
            console.error('Statblock container not found!');
            return;
        }

        // Clear previous content
        statblockContainer.innerHTML = '';

        // Dynamically set the page title
        document.title = `${monsterData.name} Statblock`;

        // Helper to get save value, defaulting to modifier if empty
        const getSaveValue = (ability) => {
            return ability.save === "" ? ability.mod : ability.save;
        };

        let contentHtml = `
            <div class="monster-title">
                ${monsterData.name}
                <i id="reset-resources-icon" class="fas fa-sync-alt reset-icon" title="Reset All Resources"></i>
            </div>
            <div class="monster-meta">${monsterData.meta}</div>
            <div class="monster-col">
                <div class="monster-topstats">
                    <ul class="statblock-list">
                        <li><span class="bold">AC</span> ${monsterData.ac} <span class="bold">Initiative</span> ${monsterData.initiative}</li>
                        <li><span class="bold">HP</span> ${monsterData.hp}</li>
                        <li><span class="bold">Speed</span> ${monsterData.speed}</li>
                    </ul>
                </div>
                <div class="monster-ability-scores">
                    <div class="monster-ability-scores1">
                        <div class="ability-header" style="grid-area: blank;"></div>
                        <div class="ability-header" style="grid-area: blank;"></div>
                        <div class="ability-header" style="grid-area: mod;">MOD</div>
                        <div class="ability-header" style="grid-area: save;">SAVE</div>
                        <div class="ability-label str">STR</div>
                        <div class="ability-score str-score">${monsterData.abilities.str.score}</div>
                        <div class="ability-mod str-mod">${monsterData.abilities.str.mod}</div>
                        <div class="ability-save str-save">${getSaveValue(monsterData.abilities.str)}</div>
                        <div class="ability-label dex">DEX</div>
                        <div class="ability-score dex-score">${monsterData.abilities.dex.score}</div>
                        <div class="ability-mod dex-mod">${monsterData.abilities.dex.mod}</div>
                        <div class="ability-save dex-save">${getSaveValue(monsterData.abilities.dex)}</div>
                        <div class="ability-label con">CON</div>
                        <div class="ability-score con-score">${monsterData.abilities.con.score}</div>
                        <div class="ability-mod con-mod">${monsterData.abilities.con.mod}</div>
                        <div class="ability-save con-save">${getSaveValue(monsterData.abilities.con)}</div>
                    </div>
                    <div class="monster-ability-scores2">
                        <div class="ability-header" style="grid-area: blank;"></div>
                        <div class="ability-header" style="grid-area: blank;"></div>
                        <div class="ability-header" style="grid-area: mod;">MOD</div>
                        <div class="ability-header" style="grid-area: save;">SAVE</div>
                        <div class="ability-label int">INT</div>
                        <div class="ability-score int-score">${monsterData.abilities.int.score}</div>
                        <div class="ability-mod int-mod">${monsterData.abilities.int.mod}</div>
                        <div class="ability-save int-save">${getSaveValue(monsterData.abilities.int)}</div>
                        <div class="ability-label wis">WIS</div>
                        <div class="ability-score wis-score">${monsterData.abilities.wis.score}</div>
                        <div class="ability-mod wis-mod">${monsterData.abilities.wis.mod}</div>
                        <div class="ability-save wis-save">${getSaveValue(monsterData.abilities.wis)}</div>
                        <div class="ability-label cha">CHA</div>
                        <div class="ability-score cha-score">${monsterData.abilities.cha.score}</div>
                        <div class="ability-mod cha-mod">${monsterData.abilities.cha.mod}</div>
                        <div class="ability-save cha-save">${getSaveValue(monsterData.abilities.cha)}</div>
                    </div>
                </div>
                <ul class="statblock-list">
                    <li><span class="bold">Skills</span> ${monsterData.skills}</li>
                    <li><span class="bold">Senses</span> ${monsterData.senses}</li>
                    <li><span class="bold">Languages</span> ${monsterData.languages}</li>
                    <li><span class="bold">CR</span> ${monsterData.cr}</li>
                </ul>
                <div class="section-title">Traits</div>
        `;

        // Render Traits
        if (monsterData.traits && monsterData.traits.length > 0) {
            monsterData.traits.forEach(trait => {
                contentHtml += `<div class="trait"><span class="trait-title italic">${trait.name}.</span> `;
                if (typeof trait.desc === 'string') {
                    // Apply spell linking before other formatting for general traits
                    let formattedDesc = formatDescriptionWithSpellLinks(trait.desc, spellUrlMap);
                    contentHtml += formattedDesc;
                    // Move tracker after description for regular traits
                    if (trait.track_uses) {
                        contentHtml += createResourceTrackers(trait.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), trait.track_uses);
                    }
                } else if (typeof trait.desc === 'object' && trait.desc.intro && trait.desc.spells_by_frequency) {
                    // Handle Spellcasting trait
                    contentHtml += `${trait.desc.intro}<br><br>`;
                    trait.desc.spells_by_frequency.forEach(freqBlock => {
                        contentHtml += `<strong>${freqBlock.frequency}</strong>`;
                        if (freqBlock.track_slots) {
                            contentHtml += createResourceTrackers(freqBlock.frequency.toLowerCase().replace(/[^a-z0-9]/g, '-'), freqBlock.track_slots);
                        }
                        contentHtml += `: `;
                        const spellsHtml = freqBlock.spells.map(spell => {
                            const spellUrl = spellUrlMap.get(spell.name.toLowerCase()) || `https://www.dndbeyond.com/spells/${spell.url_suffix}`;
                            let spellEntry = `<a class="tooltip-hover spell-tooltip" href="${spellUrl}">${spell.name}</a>${spell.notes}`;
                            // Add tracker for "1/day each" spells
                            if (freqBlock.frequency.includes("(1/day each)")) {
                                spellEntry += createResourceTrackers(spell.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), 1);
                            }
                            return spellEntry;
                        }).join(', ');
                        contentHtml += `${spellsHtml}<br>`;
                    });
                }
                contentHtml += `</div>`;
            });
        }

        // Render Actions
        if (monsterData.actions && monsterData.actions.length > 0) {
            contentHtml += `<div class="section-title">Actions</div>`;
            monsterData.actions.forEach(action => {
                contentHtml += `<div class="action"><span class="action-title italic">${action.name}.</span> `;
                let formattedDesc = formatDescriptionWithSpellLinks(action.desc, spellUrlMap); // Apply new function
                // Italicize specific phrases in the description
                formattedDesc = formattedDesc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:|Hit:|Failure:)/g, '<em>$1</em>');
                contentHtml += `${formattedDesc}`; // Description comes first
                if (action.track_uses && !action.name.includes('(Recharge')) {
                    contentHtml += createResourceTrackers(action.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), action.track_uses); // Tracker comes after
                }
                contentHtml += `</div>`;
            });
        }

        // Render Bonus Actions
        if (monsterData.bonus_actions && monsterData.bonus_actions.length > 0) {
            contentHtml += `<div class="section-title">Bonus Actions</div>`;
            monsterData.bonus_actions.forEach(bonusAction => {
                contentHtml += `<div class="bonus-action"><span class="bonus-action-title italic">${bonusAction.name}.</span> `;
                let formattedDesc = formatDescriptionWithSpellLinks(bonusAction.desc, spellUrlMap); // Apply new function
                // Italicize specific phrases in the description (if they somehow appear here)
                formattedDesc = formattedDesc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:|Hit:|Failure:)/g, '<em>$1</em>');
                contentHtml += `${formattedDesc}`; // Description comes first
                if (bonusAction.track_uses) {
                    contentHtml += createResourceTrackers(bonusAction.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), bonusAction.track_uses); // Tracker comes after
                }
                contentHtml += `</div>`;
            });
        }

        // Render Reactions
        if (monsterData.reactions && monsterData.reactions.length > 0) {
            contentHtml += `<div class="section-title">Reactions</div>`;
            monsterData.reactions.forEach(reaction => {
                contentHtml += `<div class="reaction"><span class="reaction-title italic">${reaction.name}.</span> `;
                let formattedDesc = formatDescriptionWithSpellLinks(reaction.desc, spellUrlMap); // Apply new function
                // Italicize specific phrases in the description (if they somehow appear here)
                formattedDesc = formattedDesc.replace(/(Melee Weapon Attack:|Ranged Weapon Attack:|Hit:|Failure:)/g, '<em>$1</em>');
                contentHtml += `${formattedDesc}`; // Description comes first
                if (reaction.track_uses) {
                    contentHtml += createResourceTrackers(reaction.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), reaction.track_uses); // Tracker comes after
                }
                contentHtml += `</div>`;
            });
        }

        contentHtml += `</div>`; // Close the single monster-col div

        statblockContainer.innerHTML = contentHtml;

        // Re-attach event listeners after HTML is rendered
        document.querySelectorAll('a[href^="http"]').forEach(function(link) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Re-attach persistence listeners to newly created checkboxes
        document.querySelectorAll('.resource-tracker input[type="checkbox"]').forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                saveCheckboxState(this);
            });
        });

        // Re-attach event listener to the reset icon
        const resetIcon = document.getElementById('reset-resources-icon');
        const trackers = statblockContainer.querySelectorAll('.resource-tracker'); // Find all trackers in the rendered content

        if (resetIcon) {
            if (trackers.length === 0) {
                resetIcon.style.display = 'none'; // Hide if no trackers
            } else {
                resetIcon.style.display = ''; // Ensure visible if trackers exist
            }
            resetIcon.addEventListener('click', resetCheckboxes);
        }

        // Load states for the newly rendered checkboxes
        loadCheckboxState();
    }

    let spellUrlMap = new Map(); // Declare spellUrlMap here

    // --- Main execution ---
    // Fetch monster data and render the statblock
    async function initStatblock() {
        try {
            // Fetch the spell URLs JSON first
            const spellUrlsResponse = await fetch('2024-spell-urls.json');
            const spellUrlsData = await spellUrlsResponse.json();

            // Populate the spellUrlMap for quick lookups, converting spell names to lowercase
            spellUrlsData.forEach(spell => {
                spellUrlMap.set(spell["spell-name"].toLowerCase(), spell.url);
            });

            // Get the monster JSON file path from the data-monster-src attribute
            const statblockContainer = document.getElementById('monster-statblock-container');
            const monsterJsonPath = statblockContainer.dataset.monsterSrc;

            if (!monsterJsonPath) {
                console.error('No data-monster-src attribute found on #monster-statblock-container. Cannot load monster data.');
                statblockContainer.innerHTML = '<p style="color: var(--red);">Error: Monster data source not specified.</p>';
                return;
            }

            const monsterResponse = await fetch(monsterJsonPath);
            const monsterData = await monsterResponse.json();

            // The 'column' property from JSON will now be ignored for rendering layout
            // as we are forcing a single column display.
            await renderStatblock(monsterData, spellUrlMap); // Pass spellUrlMap to renderStatblock
        } catch (error) {
            console.error('Error loading or rendering monster data:', error);
            const statblockContainer = document.getElementById('monster-statblock-container');
            statblockContainer.innerHTML = '<p style="color: var(--red);">Error loading monster data. Please check the JSON file and console for details.</p>';
        }
    }

    // Initialize the statblock rendering
    initStatblock();
});

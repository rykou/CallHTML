import { Helpers } from '../utils/helpers.js';

export class ClientCard {
    constructor(app) {
        this.app = app;
        this.element = document.getElementById('clientCard');
    }

    render(client, isDuplicate) {
        if (!client) {
            this.element.innerHTML = '<div class="no-data">No clients match your criteria</div>';
            return;
        }

        this.element.innerHTML = `
            <div class="client-info">
                <div class="phone-number">
                    ${client.phone ? client.phone : '<span class="no-phone">No phone number</span>'}
                    ${isDuplicate ? '<span class="duplicate-warning">Duplicate</span>' : ''}
                </div>
                <div class="client-name">${Helpers.escapeHtml(client.name)}</div>
                <div class="client-city">${Helpers.escapeHtml(client.city)}</div>
                <div class="client-address">${Helpers.escapeHtml(client.address)}</div>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn btn-yes" onclick="app.markAsYes()">YES</button>
                <button class="action-btn btn-no" onclick="app.markAsNo()">NO</button>
            </div>
            
            <div class="obs-section">
                <label class="obs-label">Observations:</label>
                <textarea 
                    id="obsTextarea" 
                    class="obs-textarea" 
                    placeholder="Add your notes here..."
                    onblur="app.saveObservations(this.value)"
                >${Helpers.escapeHtml(client.obs)}</textarea>
            </div>
            
            <div class="navigation">
                <button class="nav-btn" onclick="app.previousClient()">← Previous</button>
                <button class="nav-btn" onclick="app.nextClient()">Next →</button>
                <button class="nav-btn" onclick="app.skipClient()">Skip</button>
            </div>
            
            <div style="margin-top: 16px; font-size: 14px; color: #666;">
                ${this.app.currentClientIndex + 1} of ${this.app.filteredClients.length}
            </div>
        `;
    }

    clear() {
        this.element.innerHTML = '<div class="no-data">Import JSON file to get started</div>';
    }
}

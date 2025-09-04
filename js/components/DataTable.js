import { Helpers } from '../utils/helpers.js';

export class DataTable {
    constructor(app) {
        this.app = app;
        this.tbody = document.getElementById('clientsTableBody');
        this.prevBtn = document.getElementById('prevPage');
        this.nextBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
    }

    render() {
        const totalPages = Math.ceil(this.app.filteredClients.length / this.app.itemsPerPage);
        const startIndex = (this.app.currentPage - 1) * this.app.itemsPerPage;
        const endIndex = Math.min(startIndex + this.app.itemsPerPage, this.app.filteredClients.length);
        const pageClients = this.app.filteredClients.slice(startIndex, endIndex);

        if (pageClients.length === 0) {
            this.tbody.innerHTML = '<tr><td colspan="5" class="no-data">No clients found</td></tr>';
            return;
        }

        this.tbody.innerHTML = pageClients.map(client => {
            const isDuplicate = client.phone && (this.app.phoneDuplicates.get(client.phone) || 0) > 1;
            const statusClass = `status-${client.status.toLowerCase()}`;
            
            return `
                <tr onclick="app.selectClient('${client.id}')" style="cursor: pointer;">
                    <td>
                        ${client.phone || '<span style="color: #999; font-style: italic;">No number</span>'}
                        ${isDuplicate ? '<span class="duplicate-warning">Dup</span>' : ''}
                    </td>
                    <td>${Helpers.escapeHtml(client.city)}</td>
                    <td>${Helpers.escapeHtml(client.name)}</td>
                    <td><span class="status-badge ${statusClass}">${client.status}</span></td>
                    <td title="${Helpers.escapeHtml(client.obs)}">${Helpers.truncateText(client.obs, 50)}</td>
                </tr>
            `;
        }).join('');

        this.updatePagination(totalPages);
    }

    updatePagination(totalPages) {
        this.pageInfo.textContent = `Page ${this.app.currentPage} of ${totalPages || 1}`;
        this.prevBtn.disabled = this.app.currentPage === 1;
        this.nextBtn.disabled = this.app.currentPage === totalPages || totalPages === 0;
    }

    clear() {
        this.tbody.innerHTML = '<tr><td colspan="5" class="no-data">No data available</td></tr>';
        this.pageInfo.textContent = 'Page 1 of 1';
        this.prevBtn.disabled = true;
        this.nextBtn.disabled = true;
    }
}

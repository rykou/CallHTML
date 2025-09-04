import { Helpers } from './utils/helpers.js';
import { StorageManager } from './utils/storage.js';
import { ClientCard } from './components/ClientCard.js';
import { DataTable } from './components/DataTable.js';
import { DataProcessor } from './services/DataProcessor.js';

class LeadDialer {
    constructor() {
        this.clients = [];
        this.filteredClients = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentClientIndex = 0;
        this.phoneDuplicates = new Map();

        this.clientCard = new ClientCard(this);
        this.dataTable = new DataTable(this);

        this.initializeEventListeners();
        this.loadFromStorage();
    }

    initializeEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drop zone
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.filterAndRender();
        });

        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.filter;
                this.filterAndRender();
            });
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.dataTable.render();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.dataTable.render();
            }
        });

        // Export buttons
        document.getElementById('exportFullCSV').addEventListener('click', () => this.exportData('full', 'csv'));
        document.getElementById('exportFullJSON').addEventListener('click', () => this.exportData('full', 'json'));
        document.getElementById('exportLeadsCSV').addEventListener('click', () => this.exportData('leads', 'csv'));
        document.getElementById('exportLeadsJSON').addEventListener('click', () => this.exportData('leads', 'json'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case 'y':
                    e.preventDefault();
                    this.markAsYes();
                    break;
                case 'n':
                    e.preventDefault();
                    this.markAsNo();
                    break;
                case 'o':
                    e.preventDefault();
                    document.getElementById('obsTextarea')?.focus();
                    break;
                case 'j':
                    e.preventDefault();
                    this.nextClient();
                    break;
                case 'k':
                    e.preventDefault();
                    this.previousClient();
                    break;
            }
        });
    }

    async handleFileUpload(file) {
        if (!file || !file.name.endsWith('.json')) {
            Help
        async handleFileUpload(file) {
            if (!file || !file.name.endsWith('.json')) {
                Helpers.showToast('Please select a valid JSON file', 'error');
                return;
            }

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!Array.isArray(data)) {
                    throw new Error('JSON must be an array of objects');
                }

                this.processImportedData(data);
                Helpers.showToast(`Successfully imported ${data.length} records`);
            } catch (error) {
                Helpers.showToast('Error parsing JSON file: ' + error.message, 'error');
            }
        }

        processImportedData(data) {
            this.clients = DataProcessor.processImportedData(data, this.phoneDuplicates);
            this.saveToStorage();
            this.filterAndRender();
            this.updateStats();
        }

        filterAndRender() {
            this.filteredClients = this.clients.filter(client => {
                // Apply filter
                if (this.currentFilter !== 'all' && client.status !== this.currentFilter) {
                    return false;
                }

                // Apply search
                if (this.currentSearch) {
                    const searchTerm = this.currentSearch.toLowerCase();
                    return (
                        client.name.toLowerCase().includes(searchTerm) ||
                        client.city.toLowerCase().includes(searchTerm) ||
                        (client.phone && client.phone.toLowerCase().includes(searchTerm))
                    );
                }

                return true;
            });

            this.currentPage = 1;
            this.currentClientIndex = 0;
            this.dataTable.render();
            this.renderCurrentClient();
            this.updateStats();
        }

        renderCurrentClient() {
            if (this.filteredClients.length === 0) {
                this.clientCard.clear();
                return;
            }

            const client = this.filteredClients[this.currentClientIndex];
            const isDuplicate = client.phone && (this.phoneDuplicates.get(client.phone) || 0) > 1;
            this.clientCard.render(client, isDuplicate);
        }

        updateStats() {
            document.getElementById('totalCount').textContent = this.clients.length;
            document.getElementById('yesCount').textContent = this.clients.filter(c => c.status === 'YES').length;
            document.getElementById('noCount').textContent = this.clients.filter(c => c.status === 'NO').length;
            document.getElementById('unsetCount').textContent = this.clients.filter(c => c.status === 'UNSET').length;
        }

        markAsYes() {
            if (this.filteredClients.length === 0) return;
            
            const client = this.filteredClients[this.currentClientIndex];
            client.status = 'YES';
            this.saveToStorage();
            this.renderCurrentClient();
            this.dataTable.render();
            this.updateStats();
            
            // Auto-advance to next UNSET
            setTimeout(() => this.nextUnsetClient(), 300);
        }

        markAsNo() {
            if (this.filteredClients.length === 0) return;
            
            const client = this.filteredClients[this.currentClientIndex];
            client.status = 'NO';
            this.saveToStorage();
            this.renderCurrentClient();
            this.dataTable.render();
            this.updateStats();
            
            // Auto-advance to next UNSET
            setTimeout(() => this.nextUnsetClient(), 300);
        }

        saveObservations(obs) {
            if (this.filteredClients.length === 0) return;
            
            const client = this.filteredClients[this.currentClientIndex];
            client.obs = obs;
            this.saveToStorage();
        }

        nextClient() {
            if (this.filteredClients.length === 0) return;
            this.currentClientIndex = (this.currentClientIndex + 1) % this.filteredClients.length;
            this.renderCurrentClient();
        }

        previousClient() {
            if (this.filteredClients.length === 0) return;
            this.currentClientIndex = (this.currentClientIndex - 1 + this.filteredClients.length) % this.filteredClients.length;
            this.renderCurrentClient();
        }

        skipClient() {
            this.nextClient();
        }

        nextUnsetClient() {
            const unsetIndex = this.filteredClients.findIndex(client => client.status === 'UNSET');
            if (unsetIndex !== -1) {
                this.currentClientIndex = unsetIndex;
                this.renderCurrentClient();
            }
        }

        selectClient(clientId) {
            const index = this.filteredClients.findIndex(client => client.id === clientId);
            if (index !== -1) {
                this.currentClientIndex = index;
                this.renderCurrentClient();
            }
        }

        exportData(type, format) {
            let dataToExport;
            
            if (type === 'full') {
                dataToExport = this.clients;
            } else if (type === 'leads') {
                dataToExport = this.clients.filter(client => client.status === 'YES');
            } else {
                return;
            }

            const date = new Date().toISOString().split('T')[0];
            let content, filename, contentType;

            if (format === 'csv') {
                content = DataProcessor.exportToCSV(dataToExport, type);
                filename = `leads_${type}_${date}.csv`;
                contentType = 'text/csv';
            } else if (format === 'json') {
                content = DataProcessor.exportToJSON(dataToExport, type);
                filename = `leads_${type}_${date}.json`;
                contentType = 'application/json';
            }

            Helpers.downloadFile(content, filename, contentType);
            Helpers.showToast(`Exported ${dataToExport.length} records`);
        }

        saveToStorage() {
            StorageManager.saveData(this.clients, this.phoneDuplicates);
        }

        loadFromStorage() {
            const data = StorageManager.loadData();
            if (data) {
                this.clients = data.clients;
                this.phoneDuplicates = new Map(data.phoneDuplicates);
                this.filterAndRender();
                this.updateStats();
            }
        }
    }

    // Initialize the application
    const app = new LeadDialer();
    window.app = app;
</script>

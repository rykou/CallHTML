class StorageManager {
    static STORAGE_KEY = 'leadDialerData';

    static saveData(clients, phoneDuplicates) {
        try {
            const data = {
                clients,
                phoneDuplicates: Array.from(phoneDuplicates.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    static loadData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return {
                clients: parsed.clients || [],
                phoneDuplicates: new Map(parsed.phoneDuplicates || []),
                timestamp: parsed.timestamp
            };
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            return null;
        }
    }

    static clearData() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static hasData() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}

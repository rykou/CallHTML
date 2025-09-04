export class DataProcessor {
    static processImportedData(data, phoneDuplicates) {
        return data.map((item, index) => {
            const city = this.extractCity(item);
            const phone = item.mobilenumber || null;
            
            if (phone) {
                const count = phoneDuplicates.get(phone) || 0;
                phoneDuplicates.set(phone, count + 1);
            }

            return {
                id: this.generateId(item, index),
                name: item.Name || 'Unknown',
                city: city,
                address: item.address || '',
                phone: phone,
                status: 'UNSET',
                obs: '',
                meta: { raw: item }
            };
        });
    }

    static extractCity(item) {
        if (item.City) return item.City;
        if (!item.address) return 'Unknown city';
        
        const address = item.address;
        const cityMatch = address.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/);
        return cityMatch ? cityMatch[1] : 'Unknown city';
    }

    static generateId(item, index) {
        const base = `${item.Name || ''}-${item.mobilenumber || ''}-${index}`;
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
            const char = base.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `client-${Math.abs(hash)}`;
    }

    static exportToCSV(data, type) {
        const headers = ['Phone', 'Name', 'City', 'Address', 'Status', 'Observations'];
        const csvData = data.map(client => [
            client.phone || '',
            client.name,
            client.city,
            client.address,
            client.status,
            client.obs
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    static exportToJSON(data, type) {
        const exportData = data.map(client => ({
            ...client.meta.raw,
            Status: client.status,
            Observations: client.obs
        }));

        return JSON.stringify(exportData, null, 2);
    }
}

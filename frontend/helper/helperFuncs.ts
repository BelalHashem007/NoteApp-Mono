export function formatIso(iso: string): string {
    const date = new Date(iso);

    const result = date.toLocaleString('en-US', {
        month: 'short', // "Mar" 
        day: 'numeric', // "28"
        hour: 'numeric', // "8"
        minute: '2-digit', // "11"
        hour12: true     // "PM"
    });

    return result;
}
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const printHtmlReceipt = (contentHtml: string) => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
    printWindow.focus();

    // Wait for external resources to load
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

export const downloadTextFile = (filename: string, content: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};


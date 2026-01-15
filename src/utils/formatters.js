export const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const formatNumber = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + formatNumber(n % 100) : '');
        return '';
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    num %= 100;

    if (crore > 0) words += formatNumber(crore) + 'Crore ';
    if (lakh > 0) words += formatNumber(lakh) + 'Lakh ';
    if (thousand > 0) words += formatNumber(thousand) + 'Thousand ';
    if (hundred > 0) words += a[hundred] + 'Hundred ';
    if (num > 0) {
        if (words !== '') words += 'and ';
        words += formatNumber(num);
    }

    return words.trim();
};

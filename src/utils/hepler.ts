function getImageUrl(imageUrl?: string) {
    console.log(imageUrl);
    if (imageUrl?.startsWith('data:')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL_STORAGE}${imageUrl}`;

}

const formatPrice = (price: number, currency: string = 'USD') => {
    const currencyMap: { [key: string]: string } = {
        'SYP': 'ل.س',
        'USD': '$',
        'EUR': '€',
        'SAR': 'ر.س'
    };
    return `${price.toLocaleString()} ${currencyMap[currency] || currency}`;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export { getImageUrl, formatPrice, formatDate };
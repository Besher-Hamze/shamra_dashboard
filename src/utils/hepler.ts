function getImageUrl(imageUrl?: string) {
    console.log(imageUrl);
    // return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
    // if (!imageUrl) return '/logo.jpg';
    return `http://localhost:3000${imageUrl}`;
}

const formatPrice = (price: number, currency: string = 'SYP') => {
    const currencyMap: { [key: string]: string } = {
        'SYP': 'ل.س',
        'USD': '$',
        'EUR': '€',
        'SAR': 'ر.س'
    };
    return `${price.toLocaleString()} ${currencyMap[currency] || currency}`;
};
export { getImageUrl, formatPrice };
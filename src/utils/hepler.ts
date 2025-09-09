function getImageUrl(imageUrl?: string) {
    console.log(imageUrl);
    if (imageUrl?.startsWith('data:')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL_STORAGE}${imageUrl}`;

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
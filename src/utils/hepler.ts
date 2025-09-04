function getImageUrl(imageUrl?: string) {
    console.log(imageUrl);
    // return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
    // if (!imageUrl) return '/logo.jpg';
    return `http://localhost:3000${imageUrl}`;
}

export { getImageUrl };
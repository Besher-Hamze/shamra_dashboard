import BannerForm from '@/components/banners/BannerForm';

interface EditBannerPageProps {
    params: {
        id: string;
    };
}

export default function EditBannerPage({ params }: EditBannerPageProps) {
    return <BannerForm bannerId={params.id} />;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Privacy-First Toolbox. Report issues, request features, or send us your feedback.',
    openGraph: {
        title: 'Contact Us | Privacy-First Toolbox',
        description: 'Get in touch with Privacy-First Toolbox. Report issues, request features, or send us your feedback.',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const categoryColors: Record<string, string> = {
    image: '#3b82f6', // blue-500
    pdf: '#ef4444',   // red-500
    text: '#22c55e',  // green-500
    date: '#f97316',  // orange-500
    json: '#10b981',  // emerald-500
    crypto: '#475569', // slate-600
    web: '#6366f1',   // indigo-500
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        // Dynamic params
        const title = searchParams.get('title') || 'Privacy-First Toolbox'
        const description = searchParams.get('description') || 'Free online tools that never upload your files.'
        const category = searchParams.get('category') || 'web'
        const categoryLabel = searchParams.get('categoryLabel') || ''
        const isHome = searchParams.get('home') === 'true'

        const categoryColor = categoryColors[category] || '#7c3aed'

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#020617',
                        backgroundImage: `
                            radial-gradient(circle at 0% 0%, ${categoryColor}20 0%, transparent 40%),
                            radial-gradient(circle at 100% 100%, #1e1b4b 0%, transparent 40%),
                            linear-gradient(#0f172a 1px, transparent 1px),
                            linear-gradient(90deg, #0f172a 1px, transparent 1px)
                        `,
                        backgroundSize: '100% 100%, 100% 100%, 40px 40px',
                        color: 'white',
                        padding: '80px',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative Blobs */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: `${categoryColor}10`, filter: 'blur(80px)' }} />
                    <div style={{ position: 'absolute', bottom: '-80px', left: '20%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#4f46e510', filter: 'blur(60px)' }} />

                    {/* Header/Branding */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
                        <div
                            style={{
                                display: 'flex',
                                height: '70px',
                                width: '70px',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center',
                                borderRadius: '16px',
                                background: 'linear-gradient(to bottom right, #9333ea, #2563eb)',
                                marginRight: '24px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" style={{ opacity: 0.8 }} />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Privacy-First<span style={{ color: '#94a3b8', fontWeight: '300', marginLeft: '6px' }}>Toolbox</span></span>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginRight: '8px' }} />
                                <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '500' }}>100% Browser-Based • Secure</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: isHome ? 1 : 0.7, justifyContent: 'center' }}>
                            {!isHome && categoryLabel && (
                                <div
                                    style={{
                                        display: 'flex',
                                        padding: '8px 20px',
                                        borderRadius: '9999px',
                                        backgroundColor: `${categoryColor}20`,
                                        border: `1.5px solid ${categoryColor}40`,
                                        color: categoryColor,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        marginBottom: '32px',
                                        alignSelf: 'flex-start',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    {categoryLabel}
                                </div>
                            )}

                            <h1
                                style={{
                                    fontSize: isHome ? '110px' : '90px',
                                    fontWeight: '900',
                                    margin: '0 0 24px 0',
                                    backgroundImage: 'linear-gradient(to bottom right, #ffffff 30%, #94a3b8)',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    lineHeight: '1',
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                {title}
                            </h1>

                            <p
                                style={{
                                    fontSize: '34px',
                                    color: '#94a3b8',
                                    margin: 0,
                                    maxWidth: isHome ? '1000px' : '750px',
                                    lineHeight: '1.4',
                                    fontWeight: '400',
                                }}
                            >
                                {description}
                            </p>
                        </div>

                        {/* Side Visual for Tool Pages */}
                        {!isHome && (
                            <div style={{ display: 'flex', flex: 0.3, justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{
                                    width: '240px',
                                    height: '240px',
                                    borderRadius: '40px',
                                    border: `2px dashed ${categoryColor}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transform: 'rotate(6deg)',
                                    backgroundColor: `${categoryColor}05`
                                }}>
                                    <div style={{
                                        width: '180px',
                                        height: '180px',
                                        borderRadius: '30px',
                                        background: `linear-gradient(135deg, ${categoryColor}, #7c3aed)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 20px 50px ${categoryColor}30`
                                    }}>
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            {category === 'image' && <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />}
                                            {category === 'pdf' && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />}
                                            {category === 'text' && <path d="M4 7V4h16v3M9 20h6M12 4v16" />}
                                            {category === 'web' && <circle cx="12" cy="12" r="10" />}
                                            {!['image', 'pdf', 'text', 'web'].includes(category) && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 'auto',
                            paddingTop: '40px',
                            borderTop: '1px solid #1e293b',
                            justifyContent: 'space-between',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#22c55e15', marginRight: '14px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: '22px', color: '#cbd5e1', fontWeight: '500' }}>Zero Uploads</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f615', marginRight: '14px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: '22px', color: '#cbd5e1', fontWeight: '500' }}>Instant Result</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>HTTPS SECURE</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" style={{ marginLeft: '8px' }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}

'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { protectPdf } from '@/lib/workers/pdf-protect';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfProtectProps {
    file: File;
    onReset: () => void;
}

type ProtectState =
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string } }
    | { status: 'error'; message: string };

export function PdfProtect({ file, onReset }: PdfProtectProps) {
    const [state, setState] = useState<ProtectState>({ status: 'configuring' });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [permissions, setPermissions] = useState({
        printing: true,
        copying: true,
        modifying: false,
    });

    const handleProtect = useCallback(async () => {
        if (password !== confirmPassword) {
            setState({ status: 'error', message: 'Passwords do not match' });
            return;
        }

        if (password.length < 4) {
            setState({ status: 'error', message: 'Password must be at least 4 characters' });
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await protectPdf(file, {
                userPassword: password,
                permissions,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || `${file.name.replace('.pdf', '')}_protected.pdf`,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to protect PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file, password, confirmPassword, permissions]);

    const handleDownload = useCallback(() => {
        if (state.status !== 'complete') return;
        const blob = new Blob([state.result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.result.fileName;
        a.click();
        URL.revokeObjectURL(url);
    }, [state]);

    if (state.status === 'error') {
        return (
            <Card className="border-destructive bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <p className="font-semibold text-destructive">Error</p>
                        <p className="text-sm text-muted-foreground">{state.message}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => setState({ status: 'configuring' })}
                >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </Card>
        );
    }

    if (state.status === 'processing') {
        return <ProcessingStatus progress={state.progress} fileName={file.name} />;
    }

    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">PDF Protected Successfully!</h3>
                            <p className="text-sm text-muted-foreground">
                                Your PDF is now password protected
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Protected PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Protect Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Configuration state
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                        <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative mt-1">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="mt-1"
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <Label className="text-base font-semibold">Permissions</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                            What users can do with the correct password
                        </p>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.printing}
                                    onChange={(e) => setPermissions({ ...permissions, printing: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm">Allow printing</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.copying}
                                    onChange={(e) => setPermissions({ ...permissions, copying: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm">Allow copying text</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.modifying}
                                    onChange={(e) => setPermissions({ ...permissions, modifying: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm">Allow modifying</span>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleProtect}
                    disabled={!password || !confirmPassword}
                >
                    <Lock className="h-4 w-4" />
                    Protect PDF
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}

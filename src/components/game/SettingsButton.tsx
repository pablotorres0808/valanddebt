import { useRef, useState } from 'react';
import { Settings2, Gamepad2, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { toggleMute, isMuted, playSound } from '@/lib/audio';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SettingsButton = () => {
    const { language, setLanguage, t } = useLanguage();
    const [muted, setMuted] = useState(isMuted());

    const handleToggleMute = () => {
        const newState = toggleMute();
        setMuted(newState);
        // If unmuting, we might want to trigger sounds specifically? 
        // But engine hum will restart on next frame/loop if game is playing.
    };

    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-auto flex gap-2">
            {/* Volume Toggle */}
            <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 arcade-border bg-foreground/90 text-turbo-lime hover:bg-foreground hover:text-turbo-lime border-4"
                onClick={handleToggleMute}
                title={muted ? t('unmute') : t('mute')}
            >
                {muted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 arcade-border bg-foreground/90 text-turbo-lime hover:bg-foreground hover:text-turbo-lime border-4"
                    >
                        <Gamepad2 size={28} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="arcade-border bg-foreground/95 border-4 mt-2 p-1">
                    <DropdownMenuItem
                        className={`font-tech text-sm cursor-pointer ${language === 'es' ? 'text-turbo-lime' : 'text-muted-foreground'}`}
                        onClick={() => setLanguage('es')}
                    >
                        ESPAÑOL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={`font-tech text-sm cursor-pointer ${language === 'en' ? 'text-turbo-lime' : 'text-muted-foreground'}`}
                        onClick={() => setLanguage('en')}
                    >
                        ENGLISH
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SettingsButton;

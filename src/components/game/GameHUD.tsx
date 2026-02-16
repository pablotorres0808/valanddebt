import { Heart } from 'lucide-react';

interface GameHUDProps {
  score: number;
  lives: number;
  difficulty: number;
}

const GameHUD = ({ score, lives, difficulty }: GameHUDProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 pointer-events-none">
      {/* Lives */}
      <div className="arcade-border bg-foreground/80 px-4 py-2 flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            size={28}
            className={i < lives ? 'text-glitch-pink' : 'text-muted-foreground/30'}
            fill={i < lives ? 'currentColor' : 'none'}
          />
        ))}
      </div>

      {/* Score */}
      <div className="arcade-border bg-foreground/80 px-6 py-2 text-right">
        <div className="font-display text-3xl md:text-4xl text-turbo-lime neon-green">
          {score.toLocaleString()}
        </div>
        <div className="font-tech text-[10px] text-cyber-grid uppercase tracking-wider">
          LVL {difficulty}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;

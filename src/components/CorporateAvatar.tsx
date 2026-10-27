import React from 'react';
import {
  Target,
  Trophy,
  Handshake,
  Briefcase,
  Wine,
  UtensilsCrossed,
  Building,
  Crown,
  Gem,
  Sparkles,
  Plane,
  Activity,
  Globe,
  Mic,
  Bot,
  User,
  Compass,
  Flame,
  UserCheck
} from 'lucide-react';

export interface CorporateAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CorporateAvatar: React.FC<CorporateAvatarProps> = ({
  avatar = '',
  name = '',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg text-xs',
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-10 h-10 rounded-2xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
    xl: 'w-16 h-16 rounded-3xl text-xl'
  }[size];

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }[size];

  // Resolve matching silhouette icon and palette
  const getIconAndStyle = () => {
    const raw = (avatar || '').trim().toLowerCase();

    // 1. Objectives & Targets
    if (raw === '🎯' || raw.includes('target') || raw.includes('goal')) {
      return {
        icon: <Target className={`${iconSizes} text-sky-400`} strokeWidth={1.75} />,
        bg: 'bg-sky-500/10 border-sky-500/30 shadow-sky-500/10'
      };
    }

    // 2. Trophies & Awards
    if (raw === '🏆' || raw === '🥇' || raw.includes('trophy') || raw.includes('award')) {
      return {
        icon: <Trophy className={`${iconSizes} text-amber-400`} strokeWidth={1.75} />,
        bg: 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
      };
    }

    // 3. Handshakes & Partnerships
    if (raw === '🤝' || raw.includes('handshake') || raw.includes('deal') || raw.includes('partner')) {
      return {
        icon: <Handshake className={`${iconSizes} text-sky-400`} strokeWidth={1.75} />,
        bg: 'bg-sky-500/10 border-sky-500/30 shadow-sky-500/10'
      };
    }

    // 4. Cocktails, Wines & Bars
    if (raw === '🍸' || raw === '🍹' || raw === '🥂' || raw === '🍷' || raw.includes('bar') || raw.includes('cocktail') || raw.includes('wine')) {
      return {
        icon: <Wine className={`${iconSizes} text-amber-300`} strokeWidth={1.75} />,
        bg: 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
      };
    }

    // 5. Food, Gastronomy & Chefs
    if (raw === '🥑' || raw === '🌮' || raw === '🥩' || raw === '🧑‍🍳' || raw.includes('chef') || raw.includes('food') || raw.includes('tepic')) {
      return {
        icon: <UtensilsCrossed className={`${iconSizes} text-emerald-400`} strokeWidth={1.75} />,
        bg: 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10'
      };
    }

    // 6. Corporate, Executive & Business
    if (raw === '💼' || raw.includes('briefcase') || raw.includes('business')) {
      return {
        icon: <Briefcase className={`${iconSizes} text-slate-200`} strokeWidth={1.75} />,
        bg: 'bg-slate-500/10 border-[#2A344A]'
      };
    }

    if (raw === '👔' || raw.includes('tie') || raw.includes('executive')) {
      return {
        icon: <UserCheck className={`${iconSizes} text-sky-300`} strokeWidth={1.75} />,
        bg: 'bg-sky-500/10 border-sky-500/30'
      };
    }

    // 7. Royalty / Top Tier
    if (raw === '👑' || raw.includes('crown')) {
      return {
        icon: <Crown className={`${iconSizes} text-amber-400`} strokeWidth={1.75} />,
        bg: 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
      };
    }

    // 8. Luxury / Gem / VIP
    if (raw === '💎' || raw.includes('gem') || raw.includes('diamond')) {
      return {
        icon: <Gem className={`${iconSizes} text-cyan-400`} strokeWidth={1.75} />,
        bg: 'bg-cyan-500/10 border-cyan-500/30 shadow-cyan-500/10'
      };
    }

    // 9. Stars / Sparkles
    if (raw === '🌟' || raw === '✨' || raw.includes('star') || raw.includes('sparkle')) {
      return {
        icon: <Sparkles className={`${iconSizes} text-amber-300`} strokeWidth={1.75} />,
        bg: 'bg-amber-500/10 border-amber-500/30'
      };
    }

    // 10. Hotels & Boutique
    if (raw === '🏨' || raw === '🛎️' || raw.includes('hotel')) {
      return {
        icon: <Building className={`${iconSizes} text-indigo-300`} strokeWidth={1.75} />,
        bg: 'bg-indigo-500/10 border-indigo-500/30'
      };
    }

    // 11. Travel & Flights
    if (raw === '✈️' || raw.includes('plane') || raw.includes('flight')) {
      return {
        icon: <Plane className={`${iconSizes} text-sky-400`} strokeWidth={1.75} />,
        bg: 'bg-sky-500/10 border-sky-500/30'
      };
    }

    // 12. Medical / Health
    if (raw === '🩺' || raw.includes('doctor') || raw.includes('health')) {
      return {
        icon: <Activity className={`${iconSizes} text-emerald-400`} strokeWidth={1.75} />,
        bg: 'bg-emerald-500/10 border-emerald-500/30'
      };
    }

    // 13. Globe / Global
    if (raw === '🌍' || raw.includes('globe') || raw.includes('world')) {
      return {
        icon: <Globe className={`${iconSizes} text-teal-400`} strokeWidth={1.75} />,
        bg: 'bg-teal-500/10 border-teal-500/30'
      };
    }

    // 14. Persona / Mystery / Wolf
    if (raw === '🐺' || raw.includes('wolf')) {
      return {
        icon: <Flame className={`${iconSizes} text-amber-400`} strokeWidth={1.75} />,
        bg: 'bg-amber-500/10 border-amber-500/30'
      };
    }

    if (raw === '🎭' || raw === '🕵️' || raw.includes('mystery')) {
      return {
        icon: <Compass className={`${iconSizes} text-indigo-400`} strokeWidth={1.75} />,
        bg: 'bg-indigo-500/10 border-indigo-500/30'
      };
    }

    // 15. Voice / Mic
    if (raw === '🎙️' || raw.includes('mic')) {
      return {
        icon: <Mic className={`${iconSizes} text-rose-400`} strokeWidth={1.75} />,
        bg: 'bg-rose-500/10 border-rose-500/30'
      };
    }

    // 16. AI Bot
    if (raw === '🤖' || raw.includes('bot') || raw.includes('ai')) {
      return {
        icon: <Bot className={`${iconSizes} text-sky-400`} strokeWidth={1.75} />,
        bg: 'bg-sky-500/10 border-sky-500/30'
      };
    }

    // 17. Female / Male professionals
    if (raw === '👩‍💼' || raw === '👨‍💼') {
      return {
        icon: <UserCheck className={`${iconSizes} text-slate-300`} strokeWidth={1.75} />,
        bg: 'bg-slate-500/10 border-[#2A344A]'
      };
    }

    // Default Fallback: If letter/initial, show monogram; otherwise generic silhouette User
    if (name && name.trim().length > 0) {
      const initial = name.trim().charAt(0).toUpperCase();
      return {
        icon: <span className="font-bold text-slate-200 tracking-wider font-mono">{initial}</span>,
        bg: 'bg-sky-500/10 border-sky-500/30'
      };
    }

    return {
      icon: <User className={`${iconSizes} text-slate-300`} strokeWidth={1.75} />,
      bg: 'bg-[#18202F] border-[#2A344A]'
    };
  };

  const { icon, bg } = getIconAndStyle();

  return (
    <div
      className={`inline-flex items-center justify-center border shadow-sm backdrop-blur-sm shrink-0 transition-all ${sizeClasses} ${bg} ${className}`}
      aria-label={name || 'Avatar'}
    >
      {icon}
    </div>
  );
};

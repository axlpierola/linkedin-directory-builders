import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Plus, User, ArrowLeft, Linkedin, Briefcase, Building, Loader, Search, Github, Camera, Check, ExternalLink, Edit2, RefreshCw, AlertCircle, Globe, X, ChevronDown, Filter, MessageSquare, Send } from 'lucide-react';
import { BUILDER_TYPES, BUILDER_CATEGORIES_BY_TYPE, ALL_CATEGORIES, LATAM_COUNTRIES, SOCIAL_LINK_DOMAINS } from './constants';

// --- CONFIGURACIÓN API ---
const API_GATEWAY_URL = import.meta.env.VITE_API_URL || "";

// --- Country Flag Emojis ---
const COUNTRY_FLAGS = {
  "Argentina": "🇦🇷", "Bolivia": "🇧🇴", "Brasil": "🇧🇷", "Chile": "🇨🇱",
  "Colombia": "🇨🇴", "Costa Rica": "🇨🇷", "Cuba": "🇨🇺", "Ecuador": "🇪🇨",
  "El Salvador": "🇸🇻", "Guatemala": "🇬🇹", "Honduras": "🇭🇳", "México": "🇲🇽",
  "Nicaragua": "🇳🇮", "Panamá": "🇵🇦", "Paraguay": "🇵🇾", "Perú": "🇵🇪",
  "Puerto Rico": "🇵🇷", "República Dominicana": "🇩🇴", "Uruguay": "🇺🇾", "Venezuela": "🇻🇪"
};

// --- SVG Icon Components ---
const AwsBuilderIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" fill="#161D26"/>
      <path fill="currentColor" d="M3.85596 0V3.10249H12.144V0H12.8975V3.10249H16V3.85596H12.8975V12.144H16V12.8975H12.8975V16H12.144V12.8975H3.85596V16H3.10249V12.8975H0V12.144H3.10249V3.85596H0V3.10249H3.10249V0H3.85596ZM3.85596 12.144H12.144V3.85596H3.85596V12.144Z"/>
      <mask id="awsb_mask" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="3" y="3" width="10" height="10">
        <rect x="3.85596" y="3.85583" width="8.28809" height="8.28809" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#awsb_mask)">
        <rect width="9.8018" height="9.51351" transform="translate(2.45068 2.59442)" fill="url(#awsb_lg)"/>
        <rect width="9.8018" height="9.51351" transform="translate(2.45068 2.59442)" fill="url(#awsb_rg1)"/>
        <rect width="9.8018" height="9.51351" transform="translate(2.45068 2.59442)" fill="url(#awsb_rg2)"/>
        <rect width="9.8018" height="9.51351" transform="translate(2.45068 2.59442)" fill="url(#awsb_rg3)"/>
        <rect width="9.8018" height="9.51351" transform="translate(2.45068 2.59442)" fill="url(#awsb_rg4)"/>
      </g>
      <defs>
        <linearGradient id="awsb_lg" x1="0" y1="9.51351" x2="11.6652" y2="5.70002" gradientUnits="userSpaceOnUse">
          <stop offset="0.254808" stopColor="#F2ADE5"/><stop offset="0.625" stopColor="#ED24E7"/>
        </linearGradient>
        <radialGradient id="awsb_rg1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.868522 0.801684) rotate(75.0051) scale(3.59652 108.141)">
          <stop stopColor="#BF88F4"/><stop offset="1" stopColor="#BF88F4" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="awsb_rg2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(9.8018 9.51351) rotate(-90) scale(8.65837 8.03703)">
          <stop offset="0.177885" stopColor="#6F6CFA"/><stop offset="0.769231" stopColor="#6F6CFA" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="awsb_rg3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(4.28053 5.61191) rotate(-100.521) scale(5.43606 5.98432)">
          <stop offset="0.206731" stopColor="#FE96CE"/><stop offset="1" stopColor="#FE96CE" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="awsb_rg4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.3574 9.51351) rotate(-58.0843) scale(7.74474 3.07372)">
          <stop stopColor="#EFE0F0"/><stop offset="1" stopColor="#EFE0F0" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
);
const MediumIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
);
const DevToIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .67-.08.87-.25.21-.18.31-.48.31-.95v-1.97c0-.47-.11-.77-.34-.96zm13.37-7.55H3.21C1.99 2.5 1 3.48 1 4.7v14.6c0 1.22.99 2.2 2.21 2.2h17.58c1.22 0 2.21-.98 2.21-2.2V4.7c0-1.22-.99-2.2-2.21-2.2zM8.54 14.31c0 .73-.25 1.35-.75 1.85-.5.5-1.13.75-1.89.75H4V7.09h1.99c.72 0 1.33.25 1.83.75.5.5.72 1.11.72 1.83v4.64zm5.98-5.59H11.4v2.27h1.93v1.63H11.4v2.27h3.12v1.63H10.6c-.56 0-1.01-.44-1.01-1V8.09c0-.56.45-1 1.01-1h3.93v1.63zm6.29 6.28c-.44.88-1.13 1.32-2.07 1.32-.58 0-1.08-.18-1.5-.53v.43h-1.67V7.09h1.67v3.96c.42-.35.92-.53 1.5-.53.94 0 1.63.44 2.07 1.32.26.52.39 1.2.39 2.04 0 .84-.13 1.52-.39 2.12zm-2.54-4.43c-.63 0-1.03.49-1.03 1.27v2.22c0 .78.4 1.27 1.03 1.27.64 0 1.04-.49 1.04-1.27v-2.22c0-.78-.4-1.27-1.04-1.27z"/></svg>
);
const YouTubeIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

// --- Social Link Icon Map ---
const SOCIAL_ICON_MAP = {
  aws_builder: { icon: AwsBuilderIcon, label: "AWS Builder Center" },
  github: { icon: Github, label: "GitHub" },
  twitter: { icon: () => <span className="font-bold text-sm">𝕏</span>, label: "Twitter/X" },
  medium: { icon: MediumIcon, label: "Medium" },
  devto: { icon: DevToIcon, label: "Dev.to" },
  youtube: { icon: YouTubeIcon, label: "YouTube" },
  website: { icon: Globe, label: "Website" },
};

// --- URL Validation Helper ---
const validateSocialUrl = (key, url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return `URL inválida para ${key}`;
    const domains = SOCIAL_LINK_DOMAINS[key];
    if (domains) {
      const hostname = parsed.hostname.replace(/^www\./, '');
      if (!domains.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return `La URL debe ser de ${domains.join(' o ')}`;
      }
    }
    return null;
  } catch {
    return `URL inválida para ${key}`;
  }
};

// --- Componentes UI Reutilizables ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
    const variants = {
        primary: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        outline: "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
        ghost: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
        minimal: "text-xs font-medium text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 underline decoration-dotted underline-offset-4 transition-colors",
        danger: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${variant !== 'minimal' ? baseStyle : ''} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}>
        {children}
    </div>
);

// --- OTP Verification Component ---
const OtpVerification = ({ onVerified, purpose = "verificar tu identidad", initialEmail = "" }) => {
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(initialEmail ? 'sending' : 'email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [resendCount, setResendCount] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (initialEmail && step === 'sending') {
            handleSendOtp(initialEmail);
        }
    }, []);

    const handleSendOtp = async (emailToUse) => {
        const targetEmail = emailToUse || email;
        if (!targetEmail) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request_otp', email: targetEmail })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStep('otp');
                setResendCount(c => c + 1);
                const cooldown = 30 * Math.pow(2, resendCount);
                setCountdown(cooldown);
            } else if (res.status === 429) {
                const retryAfter = data.retry_after || 60;
                setCountdown(retryAfter);
                setError(`Demasiadas solicitudes. Espera ${Math.ceil(retryAfter / 60)} min.`);
                setStep('otp');
            } else {
                setError(data.error || 'Error al enviar el código');
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify_otp', email, otp })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                onVerified(email, data.session_token);
            } else if (res.status === 429) {
                const retryAfter = data.retry_after || 60;
                setCountdown(retryAfter);
                setError(`Cuenta bloqueada. Espera ${Math.ceil(retryAfter / 60)} min.`);
            } else if (data.error && data.error.toLowerCase().includes('expired')) {
                setError('Código expirado. Solicita uno nuevo.');
            } else {
                setError(data.error || 'Código incorrecto');
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        }
        setLoading(false);
    };

    const handleChangeEmail = () => {
        setStep('email');
        setOtp('');
        setError(null);
        setCountdown(0);
    };

    const formatCountdown = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {step === 'email' || step === 'sending' ? (
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || !!initialEmail}
                        autoFocus
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Enviaremos un código desde noreply@awsbuilder.dev
                    </p>
                    <Button
                        onClick={() => handleSendOtp()}
                        disabled={loading || !email || countdown > 0}
                        className="w-full"
                    >
                        {loading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                        Enviar código
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Código enviado a <span className="font-medium">{email}</span>
                        </p>
                        <button
                            onClick={handleChangeEmail}
                            className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
                        >
                            Cambiar
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3.5 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={loading}
                        autoFocus
                    />

                    {countdown > 0 && (
                        <p className="text-xs text-gray-400 text-center">
                            Reenviar disponible en {formatCountdown(countdown)}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSendOtp()}
                            disabled={loading || countdown > 0 || resendCount >= 5}
                            className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <Button
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.length !== 6}
                            className="flex-1"
                        >
                            {loading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                            Verificar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Searchable Select Component ---
const SearchableSelect = ({ options, value, onChange, placeholder = "Seleccionar...", renderOption, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} focus:ring-2 focus:ring-orange-500 outline-none transition-all text-left flex items-center justify-between`}
            >
                <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>{value ? (renderOption ? renderOption(value) : value) : placeholder}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto max-h-48">
                        {filtered.length > 0 ? filtered.map(o => (
                            <button
                                key={o}
                                type="button"
                                onClick={() => { onChange(o); setIsOpen(false); setSearch(''); }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${o === value ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                                {renderOption ? renderOption(o) : o}
                            </button>
                        )) : (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">Sin resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Enhanced Profile Card ---
const ProfileCard = ({ name, role, company, photoUrl, linkedinUrl, builder_type, builder_categories, country, social_links, isPreview = false }) => {
    const isHero = builder_type === 'AWS Hero';
    const accentColor = isHero ? 'orange' : 'blue';

    const hasSocialLinks = social_links && Object.values(social_links).some(v => v);

    const ensureUrl = (url) => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        return 'https://' + url;
    };

    return (
        <Card className="flex flex-col h-full transition-transform hover:scale-[1.01] hover:shadow-md relative group overflow-hidden">
            {/* Top accent bar */}
            <div className={`h-1.5 w-full ${isHero ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} />

            <div className="flex flex-col items-center pt-6 pb-4 px-5 flex-grow">
                {/* Large centered photo */}
                <div className="w-32 h-32 rounded-full border-3 border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-md">
                    {photoUrl ? (
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={48} className="text-gray-400" />
                    )}
                </div>

                {/* Name */}
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white text-center leading-tight">
                    {name || (isPreview ? "Tu Nombre" : "Usuario")}
                </h3>

                {/* Role & Company */}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center leading-snug">
                    {role || "Rol"} {company ? `· ${company}` : ''}
                </p>

                {/* Country */}
                {country && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {COUNTRY_FLAGS[country] || ""} {country}
                    </p>
                )}

                {/* Builder Type + Categories */}
                {builder_type && (
                    <div className="mt-3 w-full">
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isHero ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                {builder_type}
                            </span>
                        </div>
                        {builder_categories && builder_categories.length > 0 && (
                            <div className="mt-1">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-1 font-medium">Categoría</p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {builder_categories.map(cat => (
                                        <span key={cat} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isHero ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800'}`}>
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Social Links */}
                <div className="mt-auto pt-4 mt-4 w-full border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2.5">
                        {linkedinUrl && (
                            <a href={ensureUrl(linkedinUrl)} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                               className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                                <Linkedin size={18} />
                            </a>
                        )}
                        {hasSocialLinks && Object.keys(SOCIAL_ICON_MAP).map(key => {
                            const url = social_links[key];
                            if (!url) return null;
                            const iconInfo = SOCIAL_ICON_MAP[key];
                            const IconComp = iconInfo.icon;
                            return (
                                <a key={key} href={ensureUrl(url)} target="_blank" rel="noopener noreferrer" title={iconInfo.label}
                                   className="text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">
                                    <IconComp size={16} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// --- Helper para normalizar texto ---
const normalizeText = (text) => {
    return text
        ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : "";
};

// --- Aplicación Principal ---

export default function App() {
    const [theme, setTheme] = useState('light');
    const [view, setView] = useState('directory'); // directory, add, edit
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [builderTypeFilter, setBuilderTypeFilter] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [visibleCount, setVisibleCount] = useState(16);
    const PAGE_SIZE = 16;

    // OTP / Session state
    const [sessionToken, setSessionToken] = useState(null);
    const [verifiedEmail, setVerifiedEmail] = useState(null);
    const [otpVerified, setOtpVerified] = useState(false);

    // Profile creation flow states
    const [linkedinInput, setLinkedinInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fetchedData, setFetchedData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Edit flow states
    const [editStep, setEditStep] = useState('lookup'); // lookup, form
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editProfileData, setEditProfileData] = useState(null);


    // Feature Vote
    const [hasVotedCustomPhoto, setHasVotedCustomPhoto] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    // BI debounce ref
    const biDebounceRef = useRef(null);

    // Feedback modal state
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [feedbackContact, setFeedbackContact] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    // Close feedback modal on Escape
    useEffect(() => {
        if (!showFeedback) return;
        const handleEsc = (e) => { if (e.key === 'Escape' && !feedbackLoading) { setShowFeedback(false); setFeedbackSent(false); } };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [showFeedback, feedbackLoading]);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    useEffect(() => {
        if (localStorage.getItem('vote_custom_photo')) setHasVotedCustomPhoto(true);
    }, []);

    // Load profiles from DynamoDB
    const loadProfiles = useCallback(() => {
        if (API_GATEWAY_URL) {
            fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list' })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.items) {
                        setProfiles(data.items.map(item => ({ id: item.pk, ...item })));
                    }
                })
                .catch(err => console.error("Error loading profiles:", err));
        }
    }, []);

    useEffect(() => { loadProfiles(); }, [loadProfiles]);

    // BI event for search/filter (debounced)
    useEffect(() => {
        if (!searchTerm && !categoryFilter && !countryFilter && !builderTypeFilter) return;
        if (biDebounceRef.current) clearTimeout(biDebounceRef.current);
        biDebounceRef.current = setTimeout(() => {
            if (API_GATEWAY_URL) {
                fetch(API_GATEWAY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'bi_event',
                        event_type: 'search_performed',
                        metadata: {
                            name_query: searchTerm || null,
                            builder_type_filter: builderTypeFilter || null,
                            category_filter: categoryFilter || null,
                            country_filter: countryFilter || null,
                        }
                    })
                }).catch(() => {}); // fire-and-forget
            }
        }, 1000);
        return () => { if (biDebounceRef.current) clearTimeout(biDebounceRef.current); };
    }, [searchTerm, builderTypeFilter, categoryFilter, countryFilter]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleVoteCustomPhoto = () => {
        setIsVoting(true);
        setTimeout(() => {
            localStorage.setItem('vote_custom_photo', 'true');
            setHasVotedCustomPhoto(true);
            setIsVoting(false);
        }, 800);
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackMsg.trim()) return;
        setFeedbackLoading(true);
        try {
            const res = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'feedback', message: feedbackMsg, contact: feedbackContact })
            });
            const data = await res.json();
            if (data.success) {
                setFeedbackSent(true);
                setTimeout(() => {
                    setShowFeedback(false);
                    setFeedbackMsg('');
                    setFeedbackContact('');
                    setFeedbackSent(false);
                }, 2000);
            }
        } catch { /* ignore */ }
        setFeedbackLoading(false);
    };

    // --- Reset add flow ---
    const resetAddFlow = () => {
        setOtpVerified(false);
        setSessionToken(null);
        setVerifiedEmail(null);
        setLinkedinInput('');
        setFetchedData(null);
        setApiError(null);
        setFormErrors({});
    };

    // --- Reset edit flow ---
    const resetEditFlow = () => {
        setEditStep('lookup');
        setEditLoading(false);
        setEditError(null);
        setEditProfileData(null);
        setSessionToken(null);
        setVerifiedEmail(null);
        setFormErrors({});
    };

    // --- OTP Verified callback for add flow ---
    const handleOtpVerifiedForAdd = (email, token) => {
        setVerifiedEmail(email);
        setSessionToken(token);
        setOtpVerified(true);
    };

    // --- LinkedIn Analysis ---
    const analyzeLinkedinUrl = async (e) => {
        e.preventDefault();
        if (!linkedinInput) return;

        // Normalize LinkedIn URL
        let normalizedUrl = linkedinInput.trim();
        // Remove trailing slashes
        normalizedUrl = normalizedUrl.replace(/\/+$/, '');
        // Add https:// if no protocol
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = 'https://' + normalizedUrl;
        }
        // Force https
        normalizedUrl = normalizedUrl.replace(/^http:\/\//i, 'https://');
        // Ensure www prefix for linkedin.com
        normalizedUrl = normalizedUrl.replace(/^https:\/\/linkedin\.com/i, 'https://www.linkedin.com');

        setIsAnalyzing(true);
        setFetchedData(null);
        setApiError(null);

        if (API_GATEWAY_URL) {
            try {
                const response = await fetch(API_GATEWAY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'preview', linkedinUrl: normalizedUrl })
                });

                if (!response.ok) throw new Error('Error en conexión con servidor');

                const data = await response.json();
                setFetchedData({
                    ...data,
                    email: verifiedEmail,
                    builder_type: '',
                    builder_categories: [],
                    country: '',
                    social_links: { github: '', twitter: '', medium: '', devto: '', youtube: '', aws_builder: '', website: '' }
                });
            } catch (error) {
                console.error("Backend Error:", error);
                setApiError("No pudimos conectar con el servidor de scraping. Usando modo offline.");
                mockAnalyze(normalizedUrl);
            }
        } else {
            console.warn("API URL no configurada. Usando Mock local.");
            mockAnalyze(normalizedUrl);
        }

        setIsAnalyzing(false);
    };

    const mockAnalyze = (url) => {
        setTimeout(() => {
            const cleanUrl = url.split('?')[0].replace(/\/$/, "");
            const slug = cleanUrl.split('/in/')[1] || "Usuario";
            const lowerSlug = slug.toLowerCase();
            let extractedName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            let extractedPhoto = null;

            if (lowerSlug.includes("axlpierola")) {
                extractedName = "Axl Pierola";
                extractedPhoto = "https://github.com/axlpierola.png";
            }

            setFetchedData({
                name: extractedName,
                role: "Technology Enthusiast",
                company: "Tech Community",
                photoUrl: extractedPhoto,
                linkedinUrl: url,
                email: verifiedEmail,
                builder_type: '',
                builder_categories: [],
                country: '',
                social_links: { github: '', twitter: '', medium: '', devto: '', youtube: '', aws_builder: '', website: '' }
            });
        }, 1500);
    };

    // --- Validate form before submit ---
    const validateForm = (data) => {
        const errors = {};
        if (!data.builder_type) errors.builder_type = 'Selecciona tu programa AWS';
        if (!data.builder_categories || data.builder_categories.length === 0) errors.builder_categories = 'Selecciona al menos una categoría';
        if (!data.country) errors.country = 'Selecciona un país';
        if (!data.role) errors.role = 'El rol es requerido';

        return errors;
    };

    // --- Final Submit (Create) ---
    const handleFinalSubmit = async () => {
        const errors = validateForm(fetchedData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setIsSubmitting(true);
        setApiError(null);
        try {
            if (API_GATEWAY_URL) {
                const response = await fetch(API_GATEWAY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'create',
                        session_token: sessionToken,
                        data: fetchedData
                    })
                });
                const result = await response.json();
                if (result.success) {
                    resetAddFlow();
                    setView('directory');
                    loadProfiles();
                } else {
                    setApiError(result.error || 'Error al crear el perfil');
                }
            } else {
                setProfiles(prev => [{ id: Date.now(), ...fetchedData }, ...prev]);
                resetAddFlow();
                setView('directory');
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            setApiError('Error de conexión al guardar el perfil.');
        }
        setIsSubmitting(false);
    };

    const loadEditProfile = async (email, token) => {
        setEditLoading(true);
        try {
            const res = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list' })
            });
            const data = await res.json();
            if (data.items) {
                const profile = data.items.find(p => p.email === email);
                if (profile) {
                    setEditProfileData({
                        ...profile,
                        social_links: profile.social_links || { github: '', twitter: '', medium: '', devto: '', youtube: '', aws_builder: '', website: '' },
                        builder_categories: profile.builder_categories || [],
                    });
                    setEditStep('form');
                } else {
                    setEditError('No tienes perfil registrado. Registrate primero.');
                    setEditStep('lookup');
                }
            }
        } catch {
            setEditError('Error al cargar los datos del perfil.');
        }
        setEditLoading(false);
    };

    // --- Edit Flow: Submit Update ---
    const handleEditSubmit = async () => {
        const errors = validateForm(editProfileData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setEditLoading(true);
        setEditError(null);
        try {
            const res = await fetch(API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    session_token: sessionToken,
                    data: editProfileData
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                resetEditFlow();
                setView('directory');
                loadProfiles();
            } else {
                setEditError(data.error || 'Error al actualizar el perfil.');
            }
        } catch {
            setEditError('Error de conexión al actualizar.');
        }
        setEditLoading(false);
    };


    // --- Filtering ---
    const filteredProfiles = profiles.filter(profile => {
        const nameMatch = !searchTerm || normalizeText(profile.name).includes(normalizeText(searchTerm));
        const typeMatch = !builderTypeFilter || profile.builder_type === builderTypeFilter;
        const categoryMatch = !categoryFilter || (profile.builder_categories && profile.builder_categories.includes(categoryFilter));
        const countryMatch = !countryFilter || profile.country === countryFilter;
        return nameMatch && typeMatch && categoryMatch && countryMatch;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));

    const hasActiveFilters = searchTerm || builderTypeFilter || categoryFilter || countryFilter;

    const clearFilters = () => {
        setSearchTerm('');
        setBuilderTypeFilter('');
        setCategoryFilter('');
        setCountryFilter('');
        setVisibleCount(PAGE_SIZE);
    };

    // --- Extended Profile Form (shared between add and edit) ---
    const renderProfileForm = (data, setData, onSubmit, submitLabel, isLoading) => (
        <div className="space-y-6">
            {apiError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{apiError}</span>
                </div>
            )}

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="flex items-center text-xs font-semibold uppercase text-gray-500 mb-1.5 gap-2">
                        <Check size={12} className="text-green-500" /> Nombre
                        <span className="text-[10px] font-normal normal-case text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Auto</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        value={data.name || ''}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="flex items-center text-xs font-semibold uppercase text-gray-500 mb-1.5 gap-2">
                        <Edit2 size={12} className="text-orange-500" /> Rol / Cargo
                        <span className="text-[10px] font-normal normal-case text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">Requerido</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: CEO, Software Engineer, Product Manager..."
                        className={`w-full px-4 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/10 border-2 ${formErrors.role ? 'border-red-400' : 'border-orange-300 dark:border-orange-700'} focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
                        value={data.role || ''}
                        onChange={(e) => setData({ ...data, role: e.target.value })}
                    />
                    {formErrors.role && <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>}
                </div>

                {/* Company */}
                <div>
                    <label className="flex items-center text-xs font-semibold uppercase text-gray-500 mb-1.5 gap-2">
                        <Check size={12} className="text-green-500" /> Empresa
                        <span className="text-[10px] font-normal normal-case text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Auto</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        value={data.company || ''}
                        onChange={(e) => setData({ ...data, company: e.target.value })}
                    />
                </div>

                {/* Builder Type */}
                <div>
                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 block">
                        Programa AWS <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border ${formErrors.builder_type ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} focus:ring-2 focus:ring-orange-500 outline-none transition-all`}
                        value={data.builder_type || ''}
                        onChange={(e) => setData({ ...data, builder_type: e.target.value, builder_categories: [] })}
                    >
                        <option value="">Seleccionar...</option>
                        {BUILDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {formErrors.builder_type && <p className="text-xs text-red-500 mt-1">{formErrors.builder_type}</p>}
                </div>

                {/* Builder Categories (multi-select checkboxes) */}
                <div>
                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 block">
                        Categoría <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(BUILDER_CATEGORIES_BY_TYPE[data.builder_type] || []).map(cat => {
                            const isSelected = (data.builder_categories || []).includes(cat);
                            return (
                                <label key={cat} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-all ${isSelected ? 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'}`}>
                                    <input
                                        type="radio"
                                        name="builder_category"
                                        className="sr-only"
                                        checked={isSelected}
                                        onChange={() => {
                                            setData({
                                                ...data,
                                                builder_categories: [cat]
                                            });
                                        }}
                                    />
                                    {isSelected && <Check size={12} />}
                                    {cat}
                                </label>
                            );
                        })}
                    </div>
                    {!data.builder_type && <p className="text-xs text-gray-400 mt-1">Selecciona primero tu programa AWS</p>}
                    {formErrors.builder_categories && <p className="text-xs text-red-500 mt-1">{formErrors.builder_categories}</p>}
                </div>

                {/* LATAM Country */}
                <div>
                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1.5 block">
                        País <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                        options={LATAM_COUNTRIES}
                        value={data.country || ''}
                        onChange={(val) => setData({ ...data, country: val })}
                        placeholder="Buscar país..."
                        renderOption={(c) => `${COUNTRY_FLAGS[c] || ''} ${c}`}
                        error={formErrors.country}
                    />
                    {formErrors.country && <p className="text-xs text-red-500 mt-1">{formErrors.country}</p>}
                </div>

                {/* Social Links */}
                <div>
                    <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">
                        Enlaces Sociales <span className="text-gray-400 font-normal normal-case">(opcionales)</span>
                    </label>
                    <div className="space-y-3">
                        {Object.entries(SOCIAL_ICON_MAP).map(([key, { icon: IconComp, label }]) => (
                            <div key={key}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <IconComp size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`URL de ${label}`}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm`}
                                        value={(data.social_links && data.social_links[key]) || ''}
                                        onChange={(e) => setData({
                                            ...data,
                                            social_links: { ...(data.social_links || {}), [key]: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        if (view === 'edit') {
                            resetEditFlow();
                            setView('directory');
                        } else {
                            setFetchedData(null);
                            setLinkedinInput('');
                        }
                    }}
                    className="flex-1"
                >
                    <RefreshCw size={16} className="mr-2" /> {view === 'edit' ? 'Cancelar' : 'Buscar otro'}
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="flex-[2]"
                >
                    {isLoading ? <Loader className="animate-spin" /> : submitLabel}
                </Button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => { setView('directory'); resetAddFlow(); resetEditFlow(); }}>
                            <img src="/favicon.svg" alt="" className="w-8 h-8 mr-3" />
                            <span className="font-bold text-xl tracking-tight">AWS LATAM</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowFeedback(true)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                                title="Sugerencias"
                            >
                                <MessageSquare size={18} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- VISTA: DIRECTORIO --- */}
                {view === 'directory' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Directorio AWS LATAM</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Community Builders y Heroes en Latinoamérica
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setView('edit')} variant="outline" className="text-sm whitespace-nowrap">
                                    <Edit2 size={14} className="mr-1.5" />
                                    Editar
                                </Button>
                                <Button onClick={() => setView('add')} className="text-sm shadow-lg shadow-orange-500/30 whitespace-nowrap">
                                    <Plus size={16} className="mr-1.5" />
                                    Registrarme
                                </Button>
                            </div>
                        </div>

                        {/* Search and Filters - only show when there are profiles */}
                        {profiles.length > 0 && (
                        <div className="mb-6 flex flex-col gap-3">
                            <div className="relative w-full sm:max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                                    value={builderTypeFilter}
                                    onChange={(e) => { setBuilderTypeFilter(e.target.value); setCategoryFilter(''); }}
                                >
                                    <option value="">Programa</option>
                                    {BUILDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select
                                    className="px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Categoría</option>
                                    {(builderTypeFilter ? BUILDER_CATEGORIES_BY_TYPE[builderTypeFilter] || [] : ALL_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    className="px-2.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                                    value={countryFilter}
                                    onChange={(e) => setCountryFilter(e.target.value)}
                                >
                                    <option value="">País</option>
                                    {LATAM_COUNTRIES.map(c => <option key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</option>)}
                                </select>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="px-2.5 py-2 text-sm text-gray-500 hover:text-orange-600 transition-colors">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        )}

                        {filteredProfiles.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProfiles.slice(0, hasActiveFilters ? filteredProfiles.length : visibleCount).map(profile => (
                                        <ProfileCard key={profile.id || profile.pk} {...profile} />
                                    ))}
                                </div>
                                {!hasActiveFilters && visibleCount < filteredProfiles.length && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                                            className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-600 dark:hover:text-orange-400 transition-all shadow-sm"
                                        >
                                            Ver más ({filteredProfiles.length - visibleCount})
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 px-8">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-200/50 dark:border-orange-800/30">
                                        <User size={32} className="text-orange-400" />
                                    </div>
                                    {hasActiveFilters ? (
                                        <>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sin resultados</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">No encontramos perfiles con esos filtros. Prueba con otros criterios.</p>
                                            <Button onClick={clearFilters} variant="outline">
                                                Limpiar filtros
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aún no hay perfiles registrados</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                                Este directorio conecta a AWS Community Builders y Heroes de Latinoamérica. Registra tu perfil y forma parte de la comunidad.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VISTA: AGREGAR PERFIL --- */}
                {view === 'add' && (
                    <div className="animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
                        <div className="mb-8">
                            <button
                                onClick={() => { setView('directory'); resetAddFlow(); }}
                                className="flex items-center text-sm text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-4"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Volver al directorio
                            </button>
                            <h1 className="text-3xl font-bold">Únete al Directorio</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Verifica tu email, sincroniza tu LinkedIn y completa tu perfil.
                            </p>
                        </div>

                        {/* STEP 0: OTP Verification */}
                        {!otpVerified && (
                            <div className="max-w-xl mx-auto mt-12">
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold mb-4 text-center">Paso 1: Verifica tu Email</h2>
                                    <OtpVerification
                                        onVerified={handleOtpVerifiedForAdd}
                                        purpose="crear tu perfil"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 1: LinkedIn URL Input */}
                        {otpVerified && !fetchedData && (
                            <div className="max-w-xl mx-auto mt-12">
                                <form onSubmit={analyzeLinkedinUrl} className="relative z-10">
                                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">

                                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-lg flex items-start gap-2">
                                            <Check size={14} className="mt-0.5 shrink-0" />
                                            <span>Email verificado: {verifiedEmail}</span>
                                        </div>

                                        {(!API_GATEWAY_URL || apiError) && (
                                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg flex items-start gap-2">
                                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                <span>
                                                    {apiError ? apiError : "Modo Demo: API no conectada. Usando simulación local."}
                                                </span>
                                            </div>
                                        )}

                                        <label className="block text-sm font-medium mb-4 text-center text-gray-700 dark:text-gray-200">
                                            Paso 2: Pega tu URL de LinkedIn
                                        </label>

                                        <div className="relative mb-6">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600">
                                                <Linkedin size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                className="w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none text-lg transition-all"
                                                placeholder="linkedin.com/in/tu-perfil"
                                                value={linkedinInput}
                                                onChange={(e) => setLinkedinInput(e.target.value)}
                                                disabled={isAnalyzing}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full py-4 text-lg shadow-lg shadow-orange-500/20"
                                            disabled={isAnalyzing || !linkedinInput}
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader className="animate-spin mr-2" /> Analizando perfil...
                                                </>
                                            ) : "Sincronizar Datos"}
                                        </Button>

                                        <div className="mt-6 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-sm text-gray-500">¿No tienes cuenta? </span>
                                            <a
                                                href="https://www.linkedin.com/signup"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center ml-1 hover:underline"
                                            >
                                                Crear perfil oficial <ExternalLink size={12} className="ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                </form>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full opacity-50"></div>
                            </div>
                        )}

                        {/* STEP 2: Review, Extended Fields, and Submit */}
                        {otpVerified && fetchedData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start animate-in slide-in-from-bottom duration-500">
                                <div className="order-2 lg:order-1">
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg flex items-start gap-3 mb-6">
                                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full text-green-700 dark:text-green-300">
                                            <Check size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Datos sincronizados</h4>
                                            <p className="text-green-800 dark:text-green-300 text-xs mt-1">
                                                Completa los campos adicionales para publicar tu perfil.
                                            </p>
                                        </div>
                                    </div>

                                    {renderProfileForm(
                                        fetchedData,
                                        setFetchedData,
                                        handleFinalSubmit,
                                        "Confirmar y Publicar",
                                        isSubmitting
                                    )}
                                </div>

                                <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center lg:text-left">
                                        Vista Previa
                                    </h3>
                                    <div className="max-w-sm mx-auto lg:mx-0 w-full">
                                        <ProfileCard {...fetchedData} isPreview={true} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VISTA: EDITAR PERFIL --- */}
                {view === 'edit' && (
                    <div className="animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
                        <div className="mb-8">
                            <button
                                onClick={() => { setView('directory'); resetEditFlow(); }}
                                className="flex items-center text-sm text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-4"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Volver al directorio
                            </button>
                            <h1 className="text-3xl font-bold">Editar mi Perfil</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Verifica tu email para editar tu perfil.
                            </p>
                        </div>

                        {/* Step 1: OTP Verification with email */}
                        {editStep === 'lookup' && (
                            <div className="max-w-xl mx-auto mt-12">
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold mb-4 text-center">Verifica tu Email</h2>

                                    {editError && (
                                        <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>{editError}</span>
                                        </div>
                                    )}

                                    <OtpVerification
                                        onVerified={(email, token) => {
                                            setVerifiedEmail(email);
                                            setSessionToken(token);
                                            loadEditProfile(email, token);
                                        }}
                                        purpose="editar tu perfil"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {editStep === 'lookup' && editLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="animate-spin text-orange-500" size={24} />
                                <span className="ml-2 text-gray-500">Cargando perfil...</span>
                            </div>
                        )}

                        {/* Step 2: Edit Form */}
                        {editStep === 'form' && editProfileData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start animate-in slide-in-from-bottom duration-500">
                                <div className="order-2 lg:order-1">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex items-start gap-3 mb-6">
                                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-blue-700 dark:text-blue-300">
                                            <Edit2 size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Editando Perfil</h4>
                                            <p className="text-blue-800 dark:text-blue-300 text-xs mt-1">
                                                Modifica los campos que desees y guarda los cambios.
                                            </p>
                                        </div>
                                    </div>

                                    {editError && (
                                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-2">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                            <span>{editError}</span>
                                        </div>
                                    )}

                                    {renderProfileForm(
                                        editProfileData,
                                        setEditProfileData,
                                        handleEditSubmit,
                                        "Guardar Cambios",
                                        editLoading
                                    )}
                                </div>

                                <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center lg:text-left">
                                        Vista Previa
                                    </h3>
                                    <div className="max-w-sm mx-auto lg:mx-0 w-full">
                                        <ProfileCard {...editProfileData} isPreview={true} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>


            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!feedbackLoading) { setShowFeedback(false); setFeedbackSent(false); } }} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <button onClick={() => { if (!feedbackLoading) { setShowFeedback(false); setFeedbackSent(false); } }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={18} />
                        </button>

                        {feedbackSent ? (
                            <div className="text-center py-8">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={28} className="text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">Gracias por tu sugerencia</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sugerencias</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Ayudanos a mejorar esta plataforma.</p>

                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Que te gustaria ver o mejorar?"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm resize-none h-28"
                                        value={feedbackMsg}
                                        onChange={(e) => setFeedbackMsg(e.target.value)}
                                        maxLength={2000}
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="Email o telefono de contacto (opcional)"
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                                        value={feedbackContact}
                                        onChange={(e) => setFeedbackContact(e.target.value)}
                                    />
                                    <button
                                        onClick={handleFeedbackSubmit}
                                        disabled={feedbackLoading || !feedbackMsg.trim()}
                                        className="w-full px-4 py-2.5 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {feedbackLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                                        Enviar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Proyecto de código abierto
                    </p>
                    <div className="flex items-center space-x-2 text-sm font-medium">
                        <Github size={16} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-gray-600 dark:text-gray-300">Desarrollado por </span>
                        <a
                            href="https://github.com/axlpierola/linkedin-directory-builders"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors font-mono"
                        >
                            axlpierola
                        </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        &copy; {new Date().getFullYear()} Comunidad AWS LATAM.
                    </p>
                    <p className="text-[11px] text-gray-400/70 dark:text-gray-500/70 mt-3 max-w-lg text-center leading-relaxed">
                        Infraestructura 100% en AWS, sostenida por los créditos que brinda el programa AWS Community Builder.
                    </p>
                </div>
            </footer>
        </div>
    );
}

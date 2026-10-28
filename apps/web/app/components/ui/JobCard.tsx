import { MapPin, Briefcase } from 'lucide-react';

interface JobCardProps {
  id: string | number;
  title: string;
  department: string;
  location: string;
  isNew: boolean;
  description: string;
  onClick: () => void;
  fullWidth?: boolean;
  matchScore?: number;
  isTopMatch?: boolean;
}

export function JobCard({ title, department, location, isNew, description, onClick, fullWidth, matchScore, isTopMatch }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group${fullWidth ? ' w-full' : ' max-w-[70rem]'}`}
      style={{
        padding: 24,
        position: 'relative',
        width: fullWidth ? '100%' : undefined,
        maxWidth: fullWidth ? 'none' : 1120,
        background: isTopMatch
          ? 'linear-gradient(135deg, rgba(60,100,220,0.06) 0%, #ffffff 34%, #ffffff 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #fff 100%)',
        border: isTopMatch ? '1.5px solid rgba(60,100,220,0.22)' : '1.5px solid #e5e7eb',
        boxShadow: isTopMatch
          ? '0 12px 30px rgba(60,100,220,0.10)'
          : '0 2px 8px rgba(30,58,138,0.03)',
        borderRadius: '1.25rem',
        transform: 'translateY(0)',
      }}
    >
      {typeof matchScore === 'number' && isTopMatch && (
        <span
            style={{
            background: 'linear-gradient(135deg, #3C64DC 0%, #5A84E6 100%)',
            color: '#fff',
            borderRadius: 9999,
            fontSize: '0.78rem',
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 5,
            paddingBottom: 5,
            position: 'absolute',
            top: 16,
            left: 16,
            boxShadow: '0 8px 16px rgba(60,100,220,0.18)',
            letterSpacing: '0.02em',
          }}
        >
          Top match · {matchScore}%
        </span>
      )}
      {isNew && (
        <span
          style={{ background: '#3C64DC', color: '#fff', borderRadius: 9999, fontSize: '0.75rem', paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, position: 'absolute', top: 16, right: 16, boxShadow: '0 2px 8px rgba(60,100,220,0.10)' }}
        >
          New Posting
        </span>
      )}
      <h3
        style={{
          marginBottom: 12,
          paddingRight: isNew ? 128 : 112,
          transition: 'color 0.2s',
          fontSize: 22,
          fontWeight: 700,
          color: '#1E293B',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          textShadow: '0 1px 0 #f1f5f9',
        }}
  className="group-hover:text-[#3C64DC]"
      >
        {title}
      </h3>
      <div
        style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase className="w-4 h-4" />
          <span>{department}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}

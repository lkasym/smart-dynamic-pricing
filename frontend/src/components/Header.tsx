// src/components/Header.tsx
import React from 'react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  trainingStatus?: {
    isTraining: boolean;
    currentEpisode: number;
    totalEpisodes: number;
  };
  activePage?: 'dashboard' | 'products' | 'training';
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products',  label: 'Products' },
  { key: 'training',  label: 'Training' },
];

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  trainingStatus,
  activePage = 'dashboard',
}) => {
  const progressPct =
    trainingStatus && trainingStatus.totalEpisodes > 0
      ? Math.round((trainingStatus.currentEpisode / trainingStatus.totalEpisodes) * 100)
      : 0;

  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg">
      <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Title + Subtitle */}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-md opacity-80">{subtitle}</p>}
        </div>

        {/* Nav Bar */}
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-6">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.key;
              const linkClasses = `px-3 py-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-white bg-opacity-20 font-semibold'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`;
              return (
                <li key={item.key}>
                  <a href="#" className={linkClasses}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Live Training Status */}
        {trainingStatus && (
          <div className="mt-6 md:mt-0 w-full md:w-1/3">
            {trainingStatus.isTraining ? (
              <>
                <div className="flex justify-between text-sm mb-1 opacity-90">
                  <span>
                    Episode {trainingStatus.currentEpisode} of {trainingStatus.totalEpisodes}
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm opacity-80">Not training</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

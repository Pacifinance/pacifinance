/**
 * PortfolioAssetCard Component
 *
 * Elegant, compact card used for a single balance/investment asset in the
 * dashboard's "card view" (Liquidità & Disponibilità / Portfolio Investimenti).
 * Purely presentational: all values/labels arrive already formatted and
 * privacy-aware (isHidden) from the parent — no context imports here.
 *
 * Sub-account breakdown and any extra info are hidden behind a "show details"
 * toggle so the grid stays compact until the user asks for more.
 */

import React, { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import {
    PortfolioCard,
    PortfolioCardDetailsToggle,
    PortfolioCardDetails,
    SubEntryRow,
    SubEntriesMore,
} from '../styles/ModernDashboardStyled';

interface SubEntry {
    id: string | number;
    label: string;
    value: string;
}

interface PortfolioAssetCardProps {
    theme: any;
    icon: React.ComponentType<any>;
    color: string;
    gradient?: string;
    name: string;
    value: string;
    pills?: string[];
    /** 0-100, or null/undefined to omit the progress bar entirely (e.g. privacy mode). */
    progressPercent?: number | null;
    badge?: string;
    subEntries?: SubEntry[];
    subEntriesMoreLabel?: string;
    extraInfo?: React.ReactNode;
    actions?: React.ReactNode;
    density?: 'comfortable' | 'compact';
    showDetailsLabel: string;
    hideDetailsLabel: string;
}

const PortfolioAssetCard: React.FC<PortfolioAssetCardProps> = ({
    theme,
    icon: Icon,
    color,
    gradient,
    name,
    value,
    pills = [],
    progressPercent = null,
    badge,
    subEntries = [],
    subEntriesMoreLabel,
    extraInfo,
    actions,
    density = 'comfortable',
    showDetailsLabel,
    hideDetailsLabel,
}) => {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = subEntries.length > 0 || !!extraInfo;

    return (
        <PortfolioCard theme={theme} $color={color} $gradient={gradient} $density={density}>
            <div className="card-top">
                <div className="icon-chip">
                    <Icon />
                </div>
                {actions && <div className="card-actions">{actions}</div>}
            </div>

            <div className="card-name">{name}</div>
            <div className="card-value">
                {value}
                {badge && (
                    <span className="card-pill" style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }}>
                        {badge}
                    </span>
                )}
            </div>

            {pills.length > 0 && (
                <div className="card-pills">
                    {pills.map((pill, index) => (
                        <span key={index} className="card-pill">{pill}</span>
                    ))}
                </div>
            )}

            {progressPercent !== null && progressPercent !== undefined && (
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                    />
                </div>
            )}

            {hasDetails && (
                <>
                    <PortfolioCardDetailsToggle
                        type="button"
                        theme={theme}
                        $expanded={expanded}
                        onClick={() => setExpanded(prev => !prev)}
                        aria-expanded={expanded}
                    >
                        {expanded ? hideDetailsLabel : showDetailsLabel}
                        <BsChevronDown />
                    </PortfolioCardDetailsToggle>

                    {expanded && (
                        <PortfolioCardDetails theme={theme}>
                            {extraInfo}
                            {subEntries.map((entry) => (
                                <SubEntryRow key={entry.id} theme={theme}>
                                    <span className="sub-entry-label">{entry.label}</span>
                                    <span className="sub-entry-value">{entry.value}</span>
                                </SubEntryRow>
                            ))}
                            {subEntriesMoreLabel && (
                                <SubEntriesMore theme={theme}>{subEntriesMoreLabel}</SubEntriesMore>
                            )}
                        </PortfolioCardDetails>
                    )}
                </>
            )}
        </PortfolioCard>
    );
};

export default PortfolioAssetCard;

/**
 * PortfolioSection Component
 *
 * Collapsible group wrapper used by the dashboard's card view for each
 * asset group (Liquidità, Fondo di Emergenza, Portfolio Investimenti).
 * Presentational only — collapsed state and persistence live in the parent
 * (useDashboardLayout), passed in as props.
 */

import React from 'react';
import { BsChevronDown } from 'react-icons/bs';
import {
    PortfolioSectionCard,
    PortfolioSectionHeader,
    PortfolioSectionBody,
} from '../styles/ModernDashboardStyled';

interface PortfolioSectionProps {
    theme: any;
    icon: React.ComponentType<any>;
    title: string;
    totalLabel?: string;
    accent?: string;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    children: React.ReactNode;
    expandLabel: string;
    collapseLabel: string;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
    theme,
    icon: Icon,
    title,
    totalLabel,
    accent,
    collapsed,
    onToggleCollapsed,
    children,
    expandLabel,
    collapseLabel,
}) => {
    return (
        <PortfolioSectionCard theme={theme}>
            <PortfolioSectionHeader
                type="button"
                theme={theme}
                $accent={accent}
                $collapsed={collapsed}
                onClick={onToggleCollapsed}
                aria-expanded={!collapsed}
                aria-label={collapsed ? expandLabel : collapseLabel}
                title={collapsed ? expandLabel : collapseLabel}
            >
                <span className="title-group">
                    <Icon className="section-icon" />
                    <span className="section-title">{title}</span>
                </span>
                {totalLabel && <span className="section-total">{totalLabel}</span>}
                <span className="chevron"><BsChevronDown /></span>
            </PortfolioSectionHeader>

            {!collapsed && (
                <PortfolioSectionBody theme={theme}>
                    {children}
                </PortfolioSectionBody>
            )}
        </PortfolioSectionCard>
    );
};

export default PortfolioSection;

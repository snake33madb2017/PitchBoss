import React from 'react';
import type { Scenario, SavedSession } from '../types';
import { Phone, Target, Trash2, Building2, User, Edit3, Copy, Eye, EyeOff, Play, RotateCcw } from 'lucide-react';
import { SessionHistoryService } from '../services/sessionHistoryService';
import { LevelEvaluationService } from '../services/levelEvaluationService';
import { useTranslation } from '../i18n/LanguageContext';
import { CorporateAvatar } from './CorporateAvatar';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  onResume?: (session: SavedSession) => void;
  isAdmin?: boolean;
  onEdit?: (scenario: Scenario) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onSelect,
  onResume,
  isAdmin = false,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onDelete
}) => {
  const { t } = useTranslation();
  const inProgressSession = SessionHistoryService.getLatestInProgressSession(scenario.id);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-[#12161F] text-[#94A3B8] border-[#2A344A]">
            {t('filter.easy')}
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-[#12161F] text-[#FBBF24] border-[#FBBF24]/30">
            {t('filter.medium')}
          </span>
        );
      case 'hard':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-[#12161F] text-amber-300 border-amber-500/40">
            {t('filter.hard')}
          </span>
        );
      case 'hostile':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-[#12161F] text-rose-300 border-rose-500/40">
            {t('filter.hostile')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 border ${
        scenario.isHidden
          ? 'bg-[#1C2331]/60 border-[#2A344A]/60 opacity-80'
          : scenario.workspaceId === 'lovo-bar'
          ? 'bg-[#1C2331] border-[#2A344A] hover:border-[#D3A548]/70 hover:bg-[#1f2638] hover:shadow-[#D3A548]/10'
          : scenario.workspaceId === 'tepic-madrid'
          ? 'bg-[#1C2331] border-[#2A344A] hover:border-[#B39964]/70 hover:bg-[#1f2638] hover:shadow-[#B39964]/10'
          : 'bg-[#1C2331] border-[#2A344A] hover:border-[#38BDF8]/60 hover:bg-[#202838]'
      } shadow-2xl shadow-black/40 hover:-translate-y-1`}
    >
      {/* Top Header */}
      <div>
        {/* Admin Quick Action Bar */}
        {isAdmin && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2A344A]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24] flex items-center gap-1">
              {scenario.isHidden ? (
                <span className="text-[#94A3B8]">● Oculto para alumnos</span>
              ) : (
                <span className="text-emerald-400">● Activo</span>
              )}
            </span>

            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(scenario);
                  }}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#12161F] transition-colors cursor-pointer"
                  title="Editar escenario"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {onDuplicate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(scenario.id);
                  }}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161F] transition-colors cursor-pointer"
                  title="Duplicar escenario"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {onToggleVisibility && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(scenario.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    scenario.isHidden
                      ? 'text-zinc-500 hover:text-zinc-300 hover:bg-[#12161F]'
                      : 'text-[#FBBF24] hover:bg-amber-500/10'
                  }`}
                  title={scenario.isHidden ? 'Hacer visible a alumnos' : 'Ocultar a alumnos'}
                >
                  {scenario.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(scenario.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-[#12161F] transition-colors cursor-pointer"
                  title="Eliminar escenario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#12161F] text-[#E2E8F0] border-[#2A344A]">
              <Building2 className="w-3 h-3 text-[#38BDF8]" />
              {scenario.niche}
            </span>
            {scenario.workspaceId === 'lovo-bar' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-serif font-black border bg-black/80 text-[#D3A548] border-[#D3A548]/50 shadow-sm">
                <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-3.5 h-3.5 object-contain" />
                <span>LOVO Bar</span>
              </span>
            )}
            {scenario.workspaceId === 'tepic-madrid' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-serif font-bold border bg-[#21201E] text-[#FAF6EE] border-[#B39964]/50 shadow-sm">
                <div className="h-3.5 w-6 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/40">
                  <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-2.5 w-auto object-contain" />
                </div>
                <span>Tepic Madrid</span>
              </span>
            )}
            {getDifficultyBadge(scenario.difficulty)}
            {LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch One' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide border bg-sky-500/10 text-sky-400 border-sky-500/30">
                Pitch One
              </span>
            )}
            {LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch Two' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide border bg-amber-500/10 text-amber-400 border-amber-500/30">
                Pitch Two
              </span>
            )}
            {LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch Three' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide border bg-purple-500/10 text-purple-400 border-purple-500/30">
                Pitch Three
              </span>
            )}
          </div>

          {!isAdmin && scenario.isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(scenario.id);
              }}
              className="text-[#94A3B8] hover:text-rose-400 p-1 rounded-lg hover:bg-[#12161F] transition-colors cursor-pointer"
              title={t('card.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold transition-colors line-clamp-2 mb-3 text-[#E2E8F0] group-hover:text-[#38BDF8]">
          {LevelEvaluationService.cleanTitle(scenario.title)}
        </h3>

        {/* AI Character & User Role */}
        <div className="rounded-2xl p-3.5 border mb-3.5 space-y-2 bg-[#12161F]/90 border-[#2A344A]">
          <div className="flex items-center gap-2.5">
            <CorporateAvatar avatar={scenario.aiCharacter.avatar} name={scenario.aiCharacter.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-[#E2E8F0]">
                {scenario.aiCharacter.name}
              </p>
              <p className="text-[11px] truncate text-[#94A3B8]">
                {scenario.aiCharacter.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] pt-1.5 border-t text-[#94A3B8] border-[#2A344A]">
            <User className="w-3 h-3 text-[#38BDF8] shrink-0" />
            <span className="text-[#94A3B8]">{t('card.yourRole')}:</span>
            <span className="font-semibold truncate text-[#E2E8F0]">{scenario.userRole}</span>
          </div>
        </div>

        {/* Context snippet */}
        <p className="text-xs line-clamp-2 mb-3 leading-relaxed text-[#94A3B8]">
          {scenario.context}
        </p>

        {/* Objectives indicator */}
        <div className="flex items-center gap-1.5 text-xs mb-4 text-[#94A3B8]">
          <Target className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{scenario.objectives.length} {t('card.targetObjectives')}</span>
        </div>

        {/* Sample Vocabulary Tags */}
        {scenario.nicheVocabulary.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scenario.nicheVocabulary.slice(0, 3).map((vocab, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md border bg-[#12161F] text-[#94A3B8] border-[#2A344A] font-mono">
                {vocab}
              </span>
            ))}
            {scenario.nicheVocabulary.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#12161F] text-zinc-500 font-mono">
                +{scenario.nicheVocabulary.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {inProgressSession ? (
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center justify-between text-[10px] text-[#38BDF8] font-semibold px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
              Sesión en curso ({inProgressSession.messages.length} msgs)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => (onResume ? onResume(inProgressSession) : onSelect(scenario))}
              className="py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 transition-all cursor-pointer min-w-0"
              title="Continuar conversación donde se dejó"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="truncate">Continuar</span>
            </button>
            <button
              onClick={() => onSelect(scenario)}
              className="py-2.5 px-2.5 sm:px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border border-[#2A344A] bg-[#12161F] hover:bg-[#202838] text-[#94A3B8] hover:text-[#E2E8F0] transition-all cursor-pointer min-w-0"
              title="Iniciar una nueva llamada desde el principio"
            >
              <RotateCcw className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <span className="truncate">Reiniciar</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onSelect(scenario)}
          className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shadow-sky-950/30"
        >
          <Phone className="w-3.5 h-3.5 text-slate-950 shrink-0" />
          <span className="truncate">{t('card.startRoleplay')}</span>
        </button>
      )}
    </div>
  );
};

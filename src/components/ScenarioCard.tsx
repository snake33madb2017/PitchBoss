import React from 'react';
import type { Scenario, SavedSession } from '../types';
import { Phone, Target, Trash2, Building2, User, Edit3, Copy, Eye, EyeOff, Play, RotateCcw } from 'lucide-react';
import { SessionHistoryService } from '../services/sessionHistoryService';
import { useTranslation } from '../i18n/LanguageContext';

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
          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-zinc-300 border-zinc-700">
            {t('filter.easy')}
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-zinc-800 text-amber-400 border-amber-500/30">
            {t('filter.medium')}
          </span>
        );
      case 'hard':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-zinc-800 text-amber-400 border-amber-500/50">
            {t('filter.hard')}
          </span>
        );
      case 'hostile':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-zinc-800 text-zinc-100 border-zinc-600">
            {t('filter.hostile')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md border ${
        scenario.isHidden
          ? 'bg-zinc-950/70 border-zinc-800/60 opacity-80'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
      } shadow-2xl shadow-black/60 hover:-translate-y-1`}
    >
      {/* Top Header */}
      <div>
        {/* Admin Quick Action Bar */}
        {isAdmin && (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              {scenario.isHidden ? (
                <span className="text-zinc-400">● Oculto para alumnos</span>
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
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
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
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      : 'text-amber-400 hover:bg-amber-500/10'
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
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-zinc-800/80 text-zinc-300 border-zinc-700/60">
              <Building2 className="w-3 h-3 text-zinc-400" />
              {scenario.niche}
            </span>
            {getDifficultyBadge(scenario.difficulty)}
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium border bg-zinc-950 text-zinc-400 border-zinc-800">
              {scenario.targetEnglishLevel}
            </span>
          </div>

          {!isAdmin && scenario.isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(scenario.id);
              }}
              className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title={t('card.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold transition-colors line-clamp-2 mb-3 text-white group-hover:text-amber-300">
          {scenario.title}
        </h3>

        {/* AI Character & User Role */}
        <div className="rounded-2xl p-3.5 border mb-3.5 space-y-2 bg-zinc-950/80 border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="avatar">
              {scenario.aiCharacter.avatar}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-zinc-200">
                {scenario.aiCharacter.name}
              </p>
              <p className="text-[11px] truncate text-zinc-400">
                {scenario.aiCharacter.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] pt-1.5 border-t text-zinc-300 border-zinc-800/60">
            <User className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-zinc-500">{t('card.yourRole')}</span>
            <span className="font-semibold truncate text-zinc-200">{scenario.userRole}</span>
          </div>
        </div>

        {/* Context snippet */}
        <p className="text-xs line-clamp-2 mb-3 leading-relaxed text-zinc-400">
          {scenario.context}
        </p>

        {/* Objectives indicator */}
        <div className="flex items-center gap-1.5 text-xs mb-4 text-zinc-300">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>{scenario.objectives.length} {t('card.targetObjectives')}</span>
        </div>

        {/* Sample Vocabulary Tags */}
        {scenario.nicheVocabulary.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {scenario.nicheVocabulary.slice(0, 3).map((vocab, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md border bg-zinc-950 text-zinc-400 border-zinc-800 font-mono">
                {vocab}
              </span>
            ))}
            {scenario.nicheVocabulary.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-950 text-zinc-600 font-mono">
                +{scenario.nicheVocabulary.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {inProgressSession ? (
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sesión en curso ({inProgressSession.messages.length} msgs)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => (onResume ? onResume(inProgressSession) : onSelect(scenario))}
              className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer"
              title="Continuar conversación donde se dejó"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continuar</span>
            </button>
            <button
              onClick={() => onSelect(scenario)}
              className="py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
              title="Iniciar una nueva llamada desde el principio"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onSelect(scenario)}
          className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer bg-zinc-100 hover:bg-white text-zinc-950 shadow-black/30"
        >
          <Phone className="w-3.5 h-3.5 text-zinc-950" />
          <span>{t('card.startRoleplay')}</span>
        </button>
      )}
    </div>
  );
};

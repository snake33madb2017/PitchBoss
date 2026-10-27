import React, { useState } from 'react';
import {
  User,
  Check,
  X,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import type { TeamMember } from '../services/teamAnalyticsService';
import { TeamAnalyticsService } from '../services/teamAnalyticsService';

interface EmployeeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  activeEmployee: TeamMember | null;
  onSelectEmployee: (employee: TeamMember) => void;
  maxSeats: number;
}

export const EmployeeSelectorModal: React.FC<EmployeeSelectorModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  activeEmployee,
  onSelectEmployee,
  maxSeats
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    TeamAnalyticsService.getTeamMembers(workspaceId)
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Camarero de Sala');
  const [newEmail, setNewEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCount = teamMembers.length;
  const seatsAvailable = maxSeats - currentCount;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Por favor escribe tu nombre y apellido.');
      return;
    }

    if (currentCount >= maxSeats) {
      setErrorMsg(`Se ha alcanzado el límite de ${maxSeats} cupos de tu plan. El gerente debe liberar un cupo.`);
      return;
    }

    const created = TeamAnalyticsService.addMember(
      {
        name: newName.trim(),
        role: newRole.trim() || 'Colaborador',
        email: newEmail.trim() || undefined,
        workspaceId,
        scenarioId: `${workspaceId}-pitch1`,
        scenarioTitle: 'Módulo 1: Bienvenida e Introducción',
        totalSessions: 0,
        menuFluencyScore: 50,
        pronunciationScore: 50,
        upSellingScore: 50,
        objectionsMastered: 0,
        totalObjections: 4,
        totalSpokenMinutes: 0,
        lastActiveDate: Date.now(),
        status: 'in_progress',
        executiveFeedback: 'Nuevo colaborador registrado para turno de estudio.'
      },
      workspaceId
    );

    const updatedList = TeamAnalyticsService.getTeamMembers(workspaceId);
    setTeamMembers(updatedList);
    onSelectEmployee(created);
    setIsRegistering(false);
    setNewName('');
    setNewEmail('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#161D2B] border border-stone-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-[#2A344A] bg-[#12161F]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="truncate">Perfil de Alumno</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold shrink-0">
                  {currentCount}/{maxSeats} Cupos
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                {workspaceName} • Reportar progreso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Banner */}
          {activeEmployee && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shrink-0">
                  {activeEmployee.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Estudiando actualmente como: <span className="text-emerald-300">{activeEmployee.name}</span>
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">
                    {activeEmployee.role} • {activeEmployee.totalSessions} sesiones completadas
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                Activo
              </span>
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200/90 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Cada simulación de voz en inglés que realices quedará vinculada automáticamente a tu perfil y se reflejará en el informe de dirección para la gerencia de tu empresa.
            </p>
          </div>

          {/* List of Registered Staff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 px-1">
              <span>Personal Autorizado ({teamMembers.length})</span>
              <span>Progreso de Carta</span>
            </div>

            <div className="divide-y divide-[#2A344A] border border-[#2A344A] rounded-2xl bg-[#12161F] overflow-hidden">
              {teamMembers.map((member) => {
                const isCurrent = activeEmployee?.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      onSelectEmployee(member);
                      onClose();
                    }}
                    className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition cursor-pointer hover:bg-[#1C2331] ${
                      isCurrent ? 'bg-sky-500/10 border-l-4 border-l-sky-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#18202F] border border-[#2A344A] flex items-center justify-center font-bold text-sky-400 text-sm shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{member.name}</p>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                              Seleccionado
                            </span>
                          )}
                          {member.status === 'ready' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              Certificado
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                          {member.role} • {member.totalSessions} prácticas realizadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {member.menuFluencyScore}%
                        </span>
                        <p className="text-[10px] text-stone-500">fluidez</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-[#18202F] border border-[#2A344A] flex items-center justify-center text-stone-400 group-hover:text-white">
                        {isCurrent ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Employee Registration Toggle */}
          {!isRegistering ? (
            <div className="pt-2">
              <button
                onClick={() => setIsRegistering(true)}
                disabled={seatsAvailable <= 0}
                className={`w-full py-2.5 px-3 sm:px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-center leading-snug ${
                  seatsAvailable > 0
                    ? 'border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300'
                    : 'border-stone-800 bg-stone-900 text-stone-600 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {seatsAvailable > 0
                    ? `➕ Registrarme como nuevo colaborador (${seatsAvailable} cupos)`
                    : `Plan completo (${maxSeats}/${maxSeats} cupos). Contacta a gerencia.`}
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="p-4 rounded-2xl border border-sky-500/40 bg-[#12161F] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Alta Rápida de Colaborador
                </h4>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-stone-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Tu Nombre y Apellido (ej. Sofía Mendoza)"
                  className="w-full px-3 py-2 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Puesto (ej. Sumiller / Sala)"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Email corporativo (opcional)"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-400 font-semibold">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Comenzar Turno de Estudio
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A344A] bg-[#12161F] flex items-center justify-between text-xs text-stone-400">
          <span>PitchBoss Enterprise Training</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold cursor-pointer transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

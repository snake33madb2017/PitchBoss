import React, { useState, useEffect } from 'react';
import {
  User,
  Check,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Trash2,
  Plus
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

const COMMON_ROLES = [
  'Personal de Sala',
  'Bartender / Barra',
  'Sumiller',
  'Jefe de Sala / Metre',
  'Hostess / Recepción'
];

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
  const [isRegistering, setIsRegistering] = useState(() => teamMembers.length === 0);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Personal de Sala');
  const [newEmail, setNewEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = TeamAnalyticsService.getTeamMembers(workspaceId);
      setTeamMembers(current);
      if (current.length === 0) {
        setIsRegistering(true);
      }
      setErrorMsg(null);
    }
  }, [isOpen, workspaceId]);

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
      setErrorMsg(`Se ha alcanzado el límite de ${maxSeats} cupos de tu plan.`);
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
        executiveFeedback: 'Colaborador registrado. Listo para iniciar prácticas.'
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

  const handleDeleteMember = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`¿Eliminar al colaborador "${name}" y liberar su cupo?`)) {
      TeamAnalyticsService.removeMember(id);
      const updated = TeamAnalyticsService.getTeamMembers(workspaceId);
      setTeamMembers(updated);
      if (activeEmployee?.id === id) {
        const nextActive = updated.length > 0 ? updated[0] : null;
        if (nextActive) {
          onSelectEmployee(nextActive);
        } else {
          TeamAnalyticsService.setActiveEmployeeId(workspaceId, null);
        }
      }
    }
  };

  const handlePurgeAll = () => {
    if (window.confirm(`¿Estás seguro de depurar y eliminar TODOS los colaboradores de ${workspaceName}? Podrás crearlos desde cero.`)) {
      TeamAnalyticsService.purgeAllMembers(workspaceId);
      setTeamMembers([]);
      TeamAnalyticsService.setActiveEmployeeId(workspaceId, null);
      setIsRegistering(true);
    }
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

          {/* List of Registered Staff or Empty State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 px-1">
              <span>Personal Autorizado ({teamMembers.length}/{maxSeats})</span>
              {teamMembers.length > 0 && (
                <button
                  type="button"
                  onClick={handlePurgeAll}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition cursor-pointer flex items-center gap-1"
                  title="Eliminar todos los colaboradores de esta empresa"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Depurar todos</span>
                </button>
              )}
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-[#2A344A] bg-[#12161F]/80 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sin usuarios registrados</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Todos los usuarios anteriores han sido depurados. Crea tus propios colaboradores a continuación para comenzar a entrenar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#2A344A] border border-[#2A344A] rounded-2xl bg-[#12161F] overflow-hidden">
                {teamMembers.map((member) => {
                  const isCurrent = activeEmployee?.id === member.id;
                  return (
                    <div
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
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40 shrink-0">
                                Seleccionado
                              </span>
                            )}
                            {member.status === 'ready' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                                Certificado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            {member.role} • {member.totalSessions} prácticas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {member.menuFluencyScore}%
                          </span>
                          <p className="text-[10px] text-stone-500">fluidez</p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-[#18202F] border border-[#2A344A] flex items-center justify-center text-stone-400">
                          {isCurrent ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMember(e, member.id, member.name)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Employee Registration Form or Toggle Button */}
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
                <Plus className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {seatsAvailable > 0
                    ? `Registrar nuevo colaborador (${seatsAvailable} cupos disponibles)`
                    : `Plan completo (${maxSeats}/${maxSeats} cupos). Libera uno eliminando un perfil.`}
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="p-4 rounded-2xl border border-sky-500/40 bg-[#12161F] space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Crear Nuevo Colaborador</span>
                </h4>
                {teamMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-stone-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Sofía Mendoza"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Puesto / Rol:</label>
                  {/* Quick role selection chips for mobile ease */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {COMMON_ROLES.map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => setNewRole(role)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition cursor-pointer font-medium ${
                          newRole === role
                            ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                            : 'bg-[#1C2331] text-stone-300 border-[#2A344A] hover:border-slate-500'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="O escribe otro puesto personalizado"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Email Corporativo (Opcional):</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sofia@empresa.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-[#0284C7] hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-sky-500/20 active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar y Comenzar a Entrenar</span>
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

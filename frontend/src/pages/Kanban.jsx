/**
 * Página de Kanban
 * Board com drag-and-drop para gerenciamento de tarefas
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';

const COLUMNS = [
    { id: 'orcamento', title: 'Orçamento', className: 'kanban-column-todo' },
    { id: 'doing', title: 'Em Andamento', className: 'kanban-column-doing' },
    { id: 'done', title: 'Concluído', className: 'kanban-column-done' },
];

export function Kanban() {
    const [tarefas, setTarefas] = useState({});
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadTarefas();
    }, []);

    async function loadTarefas() {
        try {
            const response = await api.get('/tarefas');
            const tarefasPorStatus = {};

            COLUMNS.forEach(col => {
                tarefasPorStatus[col.id] = response.data
                    .filter(t => t.status === col.id)
                    .sort((a, b) => a.ordem - b.ordem);
            });

            setTarefas(tarefasPorStatus);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            toast.error('Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }

    async function handleSync() {
        setSyncing(true);
        try {
            const response = await api.post('/tarefas/sync');
            const { created_tasks } = response.data;
            if (created_tasks > 0) {
                toast.success(`${created_tasks} tarefa(s) sincronizada(s)`);
                loadTarefas();
            } else {
                toast.info('Tudo sincronizado!');
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
            toast.error('Erro ao sincronizar orçamentos');
        } finally {
            setSyncing(false);
        }
    }

    async function moveTarefa(tarefaId, newStatus) {
        try {
            await api.patch(`/tarefas/${tarefaId}/status`, {
                status: newStatus,
                ordem: 0,
            });
            toast.success('Tarefa movida');
            loadTarefas();
        } catch (error) {
            console.error('Erro ao mover tarefa:', error);
            toast.error('Erro ao mover tarefa');
        }
    }

    async function handleDragEnd(result) {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const sourceColumn = tarefas[source.droppableId];
        const destColumn = tarefas[destination.droppableId];
        const tarefa = sourceColumn[source.index];

        // Atualiza localmente primeiro (otimistic update)
        const newTarefas = { ...tarefas };

        if (source.droppableId === destination.droppableId) {
            // Mesma coluna
            const newColumn = Array.from(sourceColumn);
            newColumn.splice(source.index, 1);
            newColumn.splice(destination.index, 0, tarefa);
            newTarefas[source.droppableId] = newColumn;
        } else {
            // Colunas diferentes
            const newSourceColumn = Array.from(sourceColumn);
            const newDestColumn = Array.from(destColumn);

            newSourceColumn.splice(source.index, 1);
            newDestColumn.splice(destination.index, 0, tarefa);

            newTarefas[source.droppableId] = newSourceColumn;
            newTarefas[destination.droppableId] = newDestColumn;
        }

        setTarefas(newTarefas);

        // Atualiza no servidor
        try {
            await api.patch(`/tarefas/${draggableId}/status`, {
                status: destination.droppableId,
                ordem: destination.index,
            });
            toast.success('Tarefa atualizada');
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            toast.error('Erro ao atualizar tarefa');
            // Reverte em caso de erro
            loadTarefas();
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo de Tarefas</h1>
                    <p className="text-slate-500 font-medium italic">Acompanhe o andamento dos serviços contratados</p>
                </div>
                {!loading && (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`btn ${syncing ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'} flex items-center space-x-2 border shadow-sm transition-all`}
                        title="Sincronizar orçamentos aprovados"
                    >
                        <Plus size={18} className={syncing ? 'animate-spin' : ''} />
                        <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    {COLUMNS.map(column => (
                        <div key={column.id} className="flex flex-col">
                            <div className={`${column.className} rounded-t-lg border-2 px-4 py-3 opacity-50`}>
                                <h2 className="font-semibold text-slate-900">{column.title}</h2>
                                <span className="text-sm text-slate-600">Calculando...</span>
                            </div>
                            <div className="flex-1 p-4 bg-slate-50 border-2 border-t-0 border-slate-100 rounded-b-lg flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
                        {COLUMNS.map(column => (
                            <div key={column.id} className="flex flex-col">
                                <div className={`${column.className} rounded-t-lg border-2 px-4 py-3`}>
                                    <h2 className="font-semibold text-slate-900">{column.title}</h2>
                                    <span className="text-sm text-slate-600">
                                        {tarefas[column.id]?.length || 0} tarefas
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 p-2 min-h-[500px] ${snapshot.isDraggingOver ? 'bg-slate-100' : 'bg-slate-50'
                                                } border-2 border-t-0 ${column.className} rounded-b-lg overflow-y-auto`}
                                        >
                                            {tarefas[column.id]?.map((tarefa, index) => (
                                                <Draggable
                                                    key={tarefa.id}
                                                    draggableId={tarefa.id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                            }}
                                                            className={`card mb-2 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/50' : ''
                                                                }`}
                                                        >
                                                            <h3 className="font-medium text-slate-900 mb-1">
                                                                {tarefa.titulo}
                                                            </h3>
                                                            {tarefa.descricao && (
                                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                                    {tarefa.descricao}
                                                                </p>
                                                            )}
                                                            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                {tarefa.prioridade || 'Normal'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {tarefas[column.id]?.length === 0 && (
                                                <div className="py-12 text-center text-slate-400 text-xs italic">
                                                    Nenhuma tarefa nesta coluna
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}
        </div>
    );
}

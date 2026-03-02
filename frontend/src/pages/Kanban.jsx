/**
 * Página de Kanban
 * Board com drag-and-drop para gerenciamento de tarefas
 */

import { useState, useEffect } from 'react';
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

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Fluxo</h1>
                    <p className="text-slate-600">Acompanhe o andamento dos serviços contratados</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={`btn ${syncing ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'} flex items-center space-x-2 border shadow-sm transition-all`}
                    title="Sincronizar orçamentos aprovados"
                >
                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                    <span>{syncing ? 'Sincronizando...' : 'Sincronizar Orçamentos'}</span>
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                            } border-2 border-t-0 ${column.className} rounded-b-lg`}
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
                                                        className={`card mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''
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
                                                        <div className="mt-3 flex items-center justify-between border-t pt-2">
                                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${tarefa.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                                                                tarefa.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {tarefa.prioridade}
                                                            </span>

                                                            <div className="flex gap-1">
                                                                {tarefa.status === 'orcamento' && (
                                                                    <button
                                                                        onClick={() => moveTarefa(tarefa.id, 'doing')}
                                                                        className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-bold transition-colors"
                                                                    >
                                                                        Iniciar
                                                                    </button>
                                                                )}
                                                                {tarefa.status === 'doing' && (
                                                                    <button
                                                                        onClick={() => moveTarefa(tarefa.id, 'done')}
                                                                        className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded font-bold transition-colors"
                                                                    >
                                                                        Concluir
                                                                    </button>
                                                                )}
                                                                {tarefa.status === 'done' && (
                                                                    <button
                                                                        onClick={() => moveTarefa(tarefa.id, 'doing')}
                                                                        className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded font-bold transition-colors"
                                                                    >
                                                                        Refazer
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

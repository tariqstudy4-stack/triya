import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';

interface LcaState {
  // Global Parameters
  functionalUnit: string;
  referenceFlow: number;
  setGlobalParameters: (unit: string, flow: number) => void;

  // UI Modes
  isExpertMode: boolean;
  setIsExpertMode: (val: boolean) => void;

  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;

  // React Flow State
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;

  // Data Update Proxy
  updateNodeData: (nodeId: string, newData: any) => void;

  // History & Workspace
  past: { nodes: Node[]; edges: Edge[] }[];
  future: { nodes: Node[]; edges: Edge[] }[];
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  saveWorkspace: () => void;
  loadWorkspace: (json: string) => void;
}

export const useLcaStore = create<LcaState>((set, get) => ({
  functionalUnit: "1 kg of Output Product",
  referenceFlow: 1.0,
  setGlobalParameters: (unit, flow) => set({ functionalUnit: unit, referenceFlow: flow }),

  isExpertMode: false,
  setIsExpertMode: (val) => set({ isExpertMode: val }),

  activeNodeId: null,
  setActiveNodeId: (id) => set({ activeNodeId: id }),

  nodes: [],
  edges: [],
  past: [],
  future: [],

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    // Simple state limit (50 steps)
    const newPast = [...past, { nodes, edges }].slice(-50);
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future]
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture
    });
  },

  saveWorkspace: () => {
    const { nodes, edges, functionalUnit, referenceFlow } = get();
    const payload = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      canvas: { nodes, edges },
      global: { functionalUnit, referenceFlow }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triya_workspace_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadWorkspace: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.canvas) {
        set({
          nodes: data.canvas.nodes || [],
          edges: data.canvas.edges || [],
          functionalUnit: data.global?.functionalUnit || "1 kg",
          referenceFlow: data.global?.referenceFlow || 1.0,
          past: [],
          future: []
        });
      }
    } catch (e) { console.error("Load failed", e); }
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    const nodes = get().nodes;
    const edges = get().edges;

    // True Topological Cycle Detection via Depth-First Search (DFS)
    // We check if a path already exists from target to source
    const checkCycle = (startId: string, targetId: string, visited = new Set<string>()): boolean => {
      if (startId === targetId) return true;
      if (visited.has(startId)) return false;
      visited.add(startId);

      const outgoing = edges.filter(e => e.source === startId);
      for (const edge of outgoing) {
        if (checkCycle(edge.target, targetId, visited)) return true;
      }
      return false;
    };

    const isFeedback = checkCycle(connection.target!, connection.source!);

    set({ edges: addEdge({ 
        ...connection, 
        type: 'circular', 
        animated: true, 
        className: "stroke-[hsl(142,76%,36%)]",
        data: { isFeedbackLoop: isFeedback }
    }, get().edges) });
  },
  setNodes: (nodes) => {
    set((state) => ({
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes,
    }));
  },
  setEdges: (edges) => {
    set((state) => ({
      edges: typeof edges === 'function' ? edges(state.edges) : edges,
    }));
  },

  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...newData } };
        }
        return n;
      })
    }));
  }
}));

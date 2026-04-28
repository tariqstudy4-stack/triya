import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';

interface LCAState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  dashboardData: any[];
  isCalculating: boolean;
  
  // Actions
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNodeId: (id: string | null) => void;
  setDashboardData: (data: any[]) => void;
  
  // Node Updates
  updateNodeFlow: (nodeId: string, flowId: string, newAmount: number) => void;
  updateNodeData: (nodeId: string, newData: any) => void;

  // Strategic Goal & Scope
  goalAndScope: any;
  updateGoalAndScope: (path: string, value: any) => void;

  // Database Sync
  dbUpdateTrigger: number;
  triggerDbRefresh: () => void;
  activeDatabases: any[];
  setActiveDatabases: (dbs: any[]) => void;
  
  // Executive AI
  aiVerdict: string;
  setAiVerdict: (v: string) => void;
  
  // AI Hybrid Preferences
  aiPreferences: {
    engine: 'ollama' | 'gemini';
    apiKey: string;
  };
  setAiPreferences: (prefs: Partial<LCAState['aiPreferences']>) => void;
  clearAiPreferences: () => void;

  // Template Loader
  loadTemplate: (templateNodes: Node[], templateEdges: Edge[]) => void;
}

const defaultGoalAndScope = {
  projectTitle: "Industrial Strategic LCA Model",
  intendedApplication: "PEF",
  regulatoryFramework: "EU_CSRD",
  reasons: "Internal R&D optimization and hotspot identification for 2030 decarbonization.",
  intended_audience: "Internal",
  functional_unit: "",
  reference_flow: 1.0,
  cut_off_criteria: "1%",
  isComparativePublic: false,
  functionalUnit: {
    description: "1 kg of finished industrial product delivered to the factory gate",
    magnitude: 1,
    unit: "kg",
    referenceFlow: "1.05 kg of raw material input"
  },
  systemBoundary: {
    scope: "CRADLE_TO_GATE",
    capitalGoods: false,
    humanLabor: false,
    packaging: true,
    cutoffThreshold: 0.01,
    excludedFlows: ["Ancillary materials < 0.1% mass"]
  },
  allocation: {
    principle: "ALLOCATION",
    method: "MASS",
    recyclingMethod: "CUTOFF"
  },
  lcia: {
     methodology: "EF_3_1",
     categories: ["GWP100", "Land Use", "Water Scarcity"]
  },
  dataQuality: {
     timeframe: "2023-2025",
     geography: "RER (Europe)",
     technology: "Current industrial average"
  },
  review: {
     type: "INTERNAL"
  }
};

export const useLCAStore = create<LCAState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      dashboardData: [],
      isCalculating: false,
      goalAndScope: defaultGoalAndScope,
      dbUpdateTrigger: 0,

      setNodes: (nodes) => {
        set({ nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes });
      },

      setEdges: (edges) => {
        set({ edges: typeof edges === 'function' ? edges(get().edges) : edges });
      },

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection: Connection) => {
        set({
          edges: addEdge({ ...connection, animated: true }, get().edges),
        });
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      
      setDashboardData: (data) => set({ dashboardData: data }),

      updateNodeFlow: (nodeId, flowId, newAmount) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id !== nodeId) return node;
            const data = node.data as any;
            const updateArray = (arr: any[]) => arr.map((f: any) => f.id === flowId ? { ...f, amount: newAmount } : f);
            return {
              ...node,
              data: {
                ...data,
                inputs: updateArray(data.inputs || []),
                outputs: updateArray(data.outputs || []),
                elementary_flows: updateArray(data.elementary_flows || []),
              },
            };
          }),
        });
      },

      updateNodeData: (nodeId, newData) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id !== nodeId) return node;
            return { ...node, data: { ...node.data, ...newData } };
          }),
        });
      },

      updateGoalAndScope: (path, value) => {
        set((state) => {
          const keys = path.split('.');
          const update = { ...state.goalAndScope };
          let current = update;
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          return { goalAndScope: update };
        });
      },

      triggerDbRefresh: () => set((state) => ({ dbUpdateTrigger: state.dbUpdateTrigger + 1 })),
      activeDatabases: [],
      setActiveDatabases: (dbs) => set({ activeDatabases: dbs }),
      
      aiVerdict: "",
      setAiVerdict: (v) => set({ aiVerdict: v }),
      
      aiPreferences: {
        engine: 'gemini',
        apiKey: ''
      },
      setAiPreferences: (prefs) => set((state) => ({ 
        aiPreferences: { ...state.aiPreferences, ...prefs } 
      })),
      clearAiPreferences: () => set({ 
        aiPreferences: { engine: 'gemini', apiKey: '' } 
      }),

      loadTemplate: (templateNodes, templateEdges) => set({
        nodes: templateNodes,
        edges: templateEdges,
        dashboardData: [],
        aiVerdict: ""
      }),
    }),
    {
      name: 'lca-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export interface MiniLCANodeData {
    processName: string;
    description: string;
    scope: {
        functionalUnit: string;
        location: string;
    };
    technosphere: Array<{
        id: string;
        flowType: 'input' | 'output' | 'mechanism' | 'control';
        dataset_uuid: string;
        flow_name: string; // Added for display
        formula: string;
        evaluatedAmount: number;
        unit: string;
    }>;
    elementary: Array<{
        id: string;
        flowType: 'emission' | 'extraction';
        dataset_uuid: string;
        flow_name: string; // Added for display
        formula: string;
        evaluatedAmount: number;
        unit: string;
    }>;
    variables: Record<string, number>; // Local constants (e.g., { scrap_rate: 0.15 })
    allocation: {
        method: 'physical' | 'economic';
        factors: Record<string, number>;
    };
    uncertainty: Record<string, {
        type: string;
        p1: number;
        p2: number;
    }>;
}

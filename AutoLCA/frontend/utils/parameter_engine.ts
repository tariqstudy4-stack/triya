import { create, all } from 'mathjs';

const math = create(all);

/**
 * Safely evaluates a mathematical formula within a given context.
 * @param formula The algebraic string to evaluate (e.g., "mass * 0.2")
 * @param scope An object containing variable values (e.g., { mass: 50, grid_efficiency: 0.8 })
 * @returns The numerical result of the evaluation.
 */
export function evaluateFormula(formula: string | number, scope: Record<string, any>): number {
    if (typeof formula === 'number') return formula;
    if (!formula || formula.trim() === '') return 0;

    try {
        // Basic check to see if it's just a number string
        if (!isNaN(Number(formula))) {
            return Number(formula);
        }

        return math.evaluate(formula, scope);
    } catch (error) {
        console.error(`Evaluation Error for formula "${formula}":`, error);
        return 0; // Return 0 or handle error appropriately
    }
}

/**
 * Merges multiple parameter scopes into one.
 * Priority: Node Specific > Global Params
 */
export function getMergedScope(nodeInputs: Record<string, any>, globalParams: Record<string, any>): Record<string, any> {
    return {
        ...globalParams,
        ...nodeInputs
    };
}

/**
 * Topological Sort for cascading updates.
 * Expects nodes and edges from React Flow.
 */
export function getTopologicalOrder(nodes: any[], edges: any[]): any[] {
    const adjacencyList: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    nodes.forEach(node => {
        adjacencyList[node.id] = [];
        inDegree[node.id] = 0;
    });

    edges.forEach(edge => {
        if (adjacencyList[edge.source] && adjacencyList[edge.target] !== undefined) {
            adjacencyList[edge.source].push(edge.target);
            inDegree[edge.target]++;
        }
    });

    const queue: string[] = [];
    Object.keys(inDegree).forEach(id => {
        if (inDegree[id] === 0) queue.push(id);
    });

    const result: any[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        const node = nodes.find(n => n.id === u);
        if (node) result.push(node);

        adjacencyList[u].forEach(v => {
            inDegree[v]--;
            if (inDegree[v] === 0) queue.push(v);
        });
    }

    return result;
}
/**
 * Evaluates all formulas within a MiniLCANodeData object based on its variables.
 */
export function evaluateNodeData(data: any, globalParams: Record<string, any> = {}): any {
    const scope = { ...globalParams, ...(data.variables || {}) };
    const newData = { ...data };

    if (newData.technosphere) {
        newData.technosphere = newData.technosphere.map((flow: any) => ({
            ...flow,
            evaluatedAmount: evaluateFormula(flow.formula, scope)
        }));
    }

    if (newData.elementary) {
        newData.elementary = newData.elementary.map((flow: any) => ({
            ...flow,
            evaluatedAmount: evaluateFormula(flow.formula, scope)
        }));
    }

    return newData;
}

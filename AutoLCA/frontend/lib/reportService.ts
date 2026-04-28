/**
 * Triya.io Strategic Report Service
 * Handles binary PDF generation & browser-level orchestration.
 */

export const downloadLcaReport = async (payload: {
    nodes: any[];
    edges: any[];
    goalAndScope: any;
    lciaResults: any;
    snapshot?: string;
    chartSnapshot?: string;
    aiVerdict?: string;
    reportType?: "CSRD" | "CBAM" | "PEF" | "ISO";
}) => {
    try {
        const response = await fetch("/api/generate-pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nodes: payload.nodes,
                edges: payload.edges,
                complianceFramework: payload.reportType || "iso-14044",
                lciaResults: payload.lciaResults,
                snapshot: payload.snapshot,
                chart_snapshot: payload.chartSnapshot,
                ai_verdict: payload.aiVerdict,
                systemBoundary: payload.goalAndScope?.systemBoundary?.scope || "gate-to-gate",
            }),
        });

        if (!response.ok) {
            throw new Error(`Report Generation Failed: ${response.statusText}`);
        }

        // Handle binary response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date().toISOString().split("T")[0];
        
        a.href = url;
        a.download = `Triya_LCA_Report_${payload.reportType || 'ISO'}_${timestamp}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error("Report Service Error:", error);
        throw error;
    }
};

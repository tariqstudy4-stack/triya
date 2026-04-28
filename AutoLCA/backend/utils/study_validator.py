"""
ISO 14044 LCA Study Validator
Validates that a study package meets the minimum requirements for recognition
under ISO 14040/14044, EN 15804+A2, and GHG Protocol standards.
"""
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

IMPACT_CATEGORIES = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
    'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
    'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
    'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
]

# EN 15804+A2 mandatory categories (subset)
EN15804_MANDATORY = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification',
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils',
    'wsf_water_scarcity'
]

# Life cycle modules per EN 15804
VALID_MODULES = [
    "A1", "A2", "A3", "A1-A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5", "B6", "B7",
    "C1", "C2", "C3", "C4",
    "D"
]


@dataclass
class ValidationCheck:
    """Single validation check result."""
    check_id: str
    name: str
    standard: str  # iso-14044, en-15804, ghg-protocol
    passed: bool
    severity: str  # CRITICAL, WARNING, INFO
    message: str
    recommendation: Optional[str] = None


@dataclass
class ValidationReport:
    """Complete validation report for an LCA study."""
    is_valid: bool = False
    compliance_level: str = "NONE"  # NONE, PARTIAL, FULL
    critical_failures: int = 0
    warnings: int = 0
    total_checks: int = 0
    checks: List[ValidationCheck] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "compliance_level": self.compliance_level,
            "critical_failures": self.critical_failures,
            "warnings": self.warnings,
            "total_checks": self.total_checks,
            "checks": [
                {
                    "check_id": c.check_id,
                    "name": c.name,
                    "standard": c.standard,
                    "passed": c.passed,
                    "severity": c.severity,
                    "message": c.message,
                    "recommendation": c.recommendation
                }
                for c in self.checks
            ]
        }


class StudyValidator:
    """
    ISO 14044 / EN 15804+A2 Study Compliance Validator.
    
    Validates the completeness and scientific rigor of an LCA study
    across Goal & Scope, LCI, LCIA, and Interpretation phases.
    """

    def validate(
        self,
        goal_and_scope: Optional[Dict[str, Any]],
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        lcia_results: Optional[Dict[str, Any]] = None,
        sensitivity_results: Optional[Dict[str, Any]] = None,
        framework: str = "iso-14044"
    ) -> ValidationReport:
        """
        Runs the full validation suite and returns a report.
        """
        report = ValidationReport()
        checks = []

        # === GOAL & SCOPE CHECKS ===
        checks.append(self._check_functional_unit(goal_and_scope))
        checks.append(self._check_system_boundary(goal_and_scope))
        checks.append(self._check_allocation_rules(goal_and_scope))
        checks.append(self._check_data_quality_requirements(goal_and_scope))
        checks.append(self._check_lcia_methodology(goal_and_scope))
        checks.append(self._check_intended_application(goal_and_scope))

        # === LCI CHECKS ===
        checks.append(self._check_nodes_have_exchanges(nodes))
        checks.append(self._check_mass_balance(nodes, edges))
        checks.append(self._check_minimum_process_count(nodes))
        checks.append(self._check_cutoff_compliance(nodes, goal_and_scope))
        checks.append(self._check_module_assignment(nodes))
        checks.append(self._check_data_sources(nodes))

        # === LCIA CHECKS ===
        if lcia_results:
            checks.append(self._check_lcia_categories_complete(lcia_results, framework))
            checks.append(self._check_nonzero_impacts(lcia_results))
            checks.append(self._check_hotspot_identified(lcia_results))
        else:
            checks.append(ValidationCheck(
                check_id="LCIA_001", name="LCIA Calculation Performed",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="No LCIA results found. The study requires impact assessment.",
                recommendation="Run the LCIA calculation before generating the study package."
            ))

        # === INTERPRETATION CHECKS ===
        if sensitivity_results:
            checks.append(self._check_sensitivity_performed(sensitivity_results))
        else:
            checks.append(ValidationCheck(
                check_id="INT_001", name="Sensitivity Analysis",
                standard="iso-14044", passed=False, severity="WARNING",
                message="No sensitivity analysis performed.",
                recommendation="Run sensitivity analysis on the top 3 contributing nodes."
            ))

        # === REVIEW CHECKS ===
        checks.append(self._check_review_type(goal_and_scope))

        # Aggregate
        report.checks = checks
        report.total_checks = len(checks)
        report.critical_failures = sum(1 for c in checks if not c.passed and c.severity == "CRITICAL")
        report.warnings = sum(1 for c in checks if not c.passed and c.severity == "WARNING")
        report.is_valid = report.critical_failures == 0

        passed = sum(1 for c in checks if c.passed)
        ratio = passed / max(report.total_checks, 1)
        if ratio >= 0.9 and report.critical_failures == 0:
            report.compliance_level = "FULL"
        elif ratio >= 0.6:
            report.compliance_level = "PARTIAL"
        else:
            report.compliance_level = "NONE"

        return report

    # ─── GOAL & SCOPE ────────────────────────────────────────────────────

    def _check_functional_unit(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_001", name="Functional Unit Defined",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="Goal & Scope not defined. Functional Unit is mandatory per ISO 14044 Cl.4.2.3.",
                recommendation="Define the quantified performance of the product system."
            )
        fu = gs.get("functionalUnit", {})
        has_description = bool(fu.get("description", "").strip()) if isinstance(fu, dict) else bool(fu)
        has_magnitude = isinstance(fu, dict) and fu.get("magnitude", 0) > 0
        has_unit = isinstance(fu, dict) and bool(fu.get("unit", "").strip())

        passed = has_description and has_magnitude and has_unit
        missing = []
        if not has_description: missing.append("description")
        if not has_magnitude: missing.append("magnitude")
        if not has_unit: missing.append("unit")

        return ValidationCheck(
            check_id="GS_001", name="Functional Unit Defined",
            standard="iso-14044", passed=passed, severity="CRITICAL",
            message=f"Functional unit {'fully defined' if passed else f'incomplete — missing: {', '.join(missing)}'}.",
            recommendation=None if passed else "Specify quantity, unit, and description (e.g., '1 kg of steel plate delivered to factory gate')."
        )

    def _check_system_boundary(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_002", name="System Boundary Defined",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="System boundary not defined.",
                recommendation="Define scope (e.g., Cradle-to-Gate, Cradle-to-Grave)."
            )
        sb = gs.get("systemBoundary", {})
        scope = sb.get("scope", "") if isinstance(sb, dict) else str(sb)
        passed = bool(scope.strip())
        return ValidationCheck(
            check_id="GS_002", name="System Boundary Defined",
            standard="iso-14044", passed=passed, severity="CRITICAL",
            message=f"System boundary: {scope}" if passed else "System boundary scope not specified.",
            recommendation=None if passed else "Select a system boundary scope (e.g., CRADLE_TO_GATE)."
        )

    def _check_allocation_rules(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_003", name="Allocation Rules",
                standard="iso-14044", passed=False, severity="WARNING",
                message="No allocation rules defined.",
                recommendation="Specify allocation method (physical, economic, or system expansion)."
            )
        alloc = gs.get("allocation", {})
        method = alloc.get("method", "") if isinstance(alloc, dict) else ""
        passed = bool(method)
        return ValidationCheck(
            check_id="GS_003", name="Allocation Rules",
            standard="iso-14044", passed=passed, severity="WARNING",
            message=f"Allocation method: {method}" if passed else "No allocation method specified.",
            recommendation=None if passed else "Per ISO 14044 Cl.4.3.4: specify allocation procedure."
        )

    def _check_data_quality_requirements(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_004", name="Data Quality Requirements",
                standard="iso-14044", passed=False, severity="WARNING",
                message="No data quality requirements specified.",
                recommendation="Define temporal, geographical, and technological coverage requirements."
            )
        dq = gs.get("dataQuality", {})
        has_timeframe = bool(dq.get("timeframe", "")) if isinstance(dq, dict) else False
        has_geography = bool(dq.get("geography", "")) if isinstance(dq, dict) else False
        has_tech = bool(dq.get("technology", "")) if isinstance(dq, dict) else False
        passed = has_timeframe and has_geography and has_tech
        return ValidationCheck(
            check_id="GS_004", name="Data Quality Requirements",
            standard="iso-14044", passed=passed, severity="WARNING",
            message="Data quality requirements fully specified." if passed else "Incomplete data quality specification.",
            recommendation=None if passed else "Specify timeframe, geography, and technology coverage."
        )

    def _check_lcia_methodology(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_005", name="LCIA Methodology",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="No LCIA methodology selected.",
                recommendation="Select an impact assessment methodology (e.g., EF 3.1, ReCiPe, CML)."
            )
        lcia = gs.get("lcia", {})
        methodology = lcia.get("methodology", "") if isinstance(lcia, dict) else ""
        passed = bool(methodology)
        return ValidationCheck(
            check_id="GS_005", name="LCIA Methodology",
            standard="iso-14044", passed=passed, severity="CRITICAL",
            message=f"LCIA methodology: {methodology}" if passed else "No LCIA methodology selected.",
            recommendation=None if passed else "Select EF 3.1 (recommended for EU compliance) or equivalent."
        )

    def _check_intended_application(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="GS_006", name="Intended Application",
                standard="iso-14044", passed=False, severity="WARNING",
                message="Intended application not stated.",
                recommendation="State the intended application (e.g., Product Development, Marketing, Policy)."
            )
        app = gs.get("intendedApplication", "")
        passed = bool(app)
        return ValidationCheck(
            check_id="GS_006", name="Intended Application",
            standard="iso-14044", passed=passed, severity="WARNING",
            message=f"Intended application: {app}" if passed else "Not specified.",
        )

    # ─── LCI CHECKS ──────────────────────────────────────────────────────

    def _check_nodes_have_exchanges(self, nodes: List[Dict]) -> ValidationCheck:
        if not nodes:
            return ValidationCheck(
                check_id="LCI_001", name="Process Inventory Data",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="No process nodes in the model.",
                recommendation="Add at least one process node with exchange data."
            )
        empty_nodes = []
        for n in nodes:
            data = n.get("data", {})
            exchanges = data.get("exchanges", [])
            inputs = data.get("inputs", [])
            outputs = data.get("outputs", [])
            if not exchanges and not inputs and not outputs:
                label = data.get("processName", data.get("label", n.get("id", "Unknown")))
                empty_nodes.append(label)

        passed = len(empty_nodes) == 0
        return ValidationCheck(
            check_id="LCI_001", name="Process Inventory Data",
            standard="iso-14044", passed=passed,
            severity="CRITICAL" if len(empty_nodes) > len(nodes) * 0.5 else "WARNING",
            message=f"All {len(nodes)} nodes have exchange data." if passed else f"{len(empty_nodes)} node(s) have no exchanges: {', '.join(empty_nodes[:5])}.",
            recommendation=None if passed else "Populate nodes with LCI exchanges from the database library or manual entry."
        )

    def _check_mass_balance(self, nodes: List[Dict], edges: List[Dict]) -> ValidationCheck:
        """Basic mass balance check: total inputs ≈ total outputs for each node."""
        imbalanced = []
        for n in nodes:
            data = n.get("data", {})
            exchanges = data.get("exchanges", [])
            total_in = sum(float(ex.get("amount", 0)) for ex in exchanges if ex.get("is_input") or ex.get("flow_type") == "Input")
            total_out = sum(float(ex.get("amount", 0)) for ex in exchanges if not ex.get("is_input") and ex.get("flow_type") != "Input")

            if total_in > 0 and total_out > 0:
                residual = abs(total_in - total_out) / max(total_in, 0.001)
                if residual > 0.2:  # 20% tolerance
                    label = data.get("processName", data.get("label", n.get("id")))
                    imbalanced.append(f"{label} ({residual*100:.0f}%)")

        passed = len(imbalanced) == 0
        return ValidationCheck(
            check_id="LCI_002", name="Mass Balance Check",
            standard="iso-14044", passed=passed, severity="WARNING",
            message="Mass balance OK for all nodes." if passed else f"Mass imbalance in: {', '.join(imbalanced[:3])}.",
            recommendation=None if passed else "Review input/output quantities for consistency."
        )

    def _check_minimum_process_count(self, nodes: List[Dict]) -> ValidationCheck:
        count = len(nodes)
        passed = count >= 1
        return ValidationCheck(
            check_id="LCI_003", name="Minimum Process Count",
            standard="iso-14044", passed=passed, severity="CRITICAL",
            message=f"{count} process(es) in the model." if passed else "No processes in the model.",
            recommendation=None if passed else "A minimum of 1 process node is required."
        )

    def _check_cutoff_compliance(self, nodes: List[Dict], gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="LCI_004", name="Cut-off Rule Compliance",
                standard="iso-14044", passed=True, severity="INFO",
                message="No cut-off threshold defined — all flows included."
            )
        sb = gs.get("systemBoundary", {})
        threshold = float(sb.get("cutoffThreshold", 0)) if isinstance(sb, dict) else 0
        excluded = sb.get("excludedFlows", []) if isinstance(sb, dict) else []
        passed = threshold <= 0.05  # ISO recommends <5%
        return ValidationCheck(
            check_id="LCI_004", name="Cut-off Rule Compliance",
            standard="iso-14044", passed=passed, severity="WARNING",
            message=f"Cut-off threshold: {threshold*100:.1f}%. Excluded flows: {len(excluded)}.",
            recommendation=None if passed else "ISO 14044 recommends cut-off ≤ 5% of mass/energy."
        )

    def _check_module_assignment(self, nodes: List[Dict]) -> ValidationCheck:
        unassigned = []
        for n in nodes:
            data = n.get("data", {})
            module = data.get("module", "")
            if not module or module not in VALID_MODULES:
                label = data.get("processName", data.get("label", n.get("id")))
                unassigned.append(label)
        passed = len(unassigned) == 0
        return ValidationCheck(
            check_id="LCI_005", name="Life Cycle Module Assignment",
            standard="en-15804", passed=passed, severity="WARNING",
            message="All nodes assigned to life cycle modules." if passed else f"{len(unassigned)} node(s) missing module tags.",
            recommendation=None if passed else "Assign each node to a module (A1-A3, B1-B7, C1-C4, D) for EN 15804 compliance."
        )

    def _check_data_sources(self, nodes: List[Dict]) -> ValidationCheck:
        library_count = 0
        manual_count = 0
        for n in nodes:
            data = n.get("data", {})
            if data.get("processId") or data.get("is_library"):
                library_count += 1
            else:
                manual_count += 1
        total = library_count + manual_count
        passed = library_count > 0 or total == 0
        return ValidationCheck(
            check_id="LCI_006", name="Data Source Traceability",
            standard="iso-14044", passed=passed, severity="INFO",
            message=f"{library_count} node(s) from database, {manual_count} manually defined.",
            recommendation="Link processes to LCI database entries for improved traceability."
        )

    # ─── LCIA CHECKS ─────────────────────────────────────────────────────

    def _check_lcia_categories_complete(self, results: Dict, framework: str) -> ValidationCheck:
        impacts = results.get("impacts", {})
        if framework == "en-15804":
            required = EN15804_MANDATORY
        else:
            required = ["gwp_climate_change"]  # Minimum

        missing = [cat for cat in required if cat not in impacts or impacts[cat] is None]
        passed = len(missing) == 0
        return ValidationCheck(
            check_id="LCIA_002", name="Impact Category Completeness",
            standard=framework, passed=passed,
            severity="CRITICAL" if framework == "en-15804" else "WARNING",
            message=f"All {len(required)} required categories present." if passed else f"Missing categories: {', '.join(missing)}.",
            recommendation=None if passed else "Ensure all mandatory impact categories are characterized."
        )

    def _check_nonzero_impacts(self, results: Dict) -> ValidationCheck:
        impacts = results.get("impacts", {})
        zero_cats = [cat for cat, val in impacts.items() if val == 0.0]
        gwp = impacts.get("gwp_climate_change", 0)
        passed = gwp != 0
        return ValidationCheck(
            check_id="LCIA_003", name="Non-Zero Impact Validation",
            standard="iso-14044", passed=passed, severity="CRITICAL" if not passed else "INFO",
            message=f"GWP = {gwp:.4e} kg CO2-eq. {len(zero_cats)} categories at zero." if passed else "Total GWP is zero — model has no environmental impact.",
            recommendation=None if passed else "Verify that process nodes have elementary flows with characterization data."
        )

    def _check_hotspot_identified(self, results: Dict) -> ValidationCheck:
        breakdown = results.get("node_breakdown", {})
        passed = len(breakdown) > 0
        return ValidationCheck(
            check_id="LCIA_004", name="Hotspot Identification",
            standard="iso-14044", passed=passed, severity="INFO",
            message=f"Node-level breakdown available for {len(breakdown)} processes." if passed else "No node breakdown data.",
        )

    # ─── INTERPRETATION CHECKS ───────────────────────────────────────────

    def _check_sensitivity_performed(self, sens: Dict) -> ValidationCheck:
        has_data = bool(sens.get("baseline")) or bool(sens.get("node_id"))
        return ValidationCheck(
            check_id="INT_002", name="Sensitivity Analysis Complete",
            standard="iso-14044", passed=has_data, severity="WARNING",
            message="Sensitivity analysis completed." if has_data else "Sensitivity analysis data incomplete.",
            recommendation=None if has_data else "Run sensitivity on the primary contributing process."
        )

    def _check_review_type(self, gs: Optional[Dict]) -> ValidationCheck:
        if not gs:
            return ValidationCheck(
                check_id="REV_001", name="Review Type Declared",
                standard="iso-14044", passed=False, severity="WARNING",
                message="No review type declared.",
                recommendation="Declare review type (INTERNAL, EXTERNAL, or PANEL) per ISO 14044 Cl.6."
            )
        review = gs.get("review", {})
        review_type = review.get("type", "") if isinstance(review, dict) else ""
        is_comparative = gs.get("isComparativePublic", False)

        if is_comparative and review_type != "PANEL":
            return ValidationCheck(
                check_id="REV_001", name="Review Type Declared",
                standard="iso-14044", passed=False, severity="CRITICAL",
                message="Comparative public assertion requires PANEL review per ISO 14044 Cl.6.3.",
                recommendation="Change review type to PANEL for comparative disclosure."
            )

        passed = bool(review_type)
        return ValidationCheck(
            check_id="REV_001", name="Review Type Declared",
            standard="iso-14044", passed=passed, severity="WARNING",
            message=f"Review type: {review_type}" if passed else "Not specified.",
        )

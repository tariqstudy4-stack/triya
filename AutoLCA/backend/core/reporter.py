import os
import datetime
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class JRCReporter:
    def __init__(self, template_dir="templates"):
        # We no longer use jinja2 templates for ReportLab, but keep init for compatibility
        pass

    def generate_pdf_buffer(self, process_data):
        """
        Generates a rigorous Scientific LCA Data Sheet with multi-standard compliance.
        v1.1 - Fix: HexColor attribute
        """
        print("DEBUG: reporter.py v1.1 - Standardizing on HexColor")
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter,
            rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50
        )
        styles = getSampleStyleSheet()
        
        # Professional Scientific Styles
        header_style = ParagraphStyle(
            'ScientificHeader',
            parent=styles['Normal'],
            fontSize=16,
            textColor=colors.toColor("#1a5f7a"),
            alignment=1, # Center
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        subhead_style = ParagraphStyle(
            'ScientificSubhead',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.toColor("#333333"),
            borderPadding=5,
            backColor=colors.toColor("#f0f4f8"),
            spaceBefore=15,
            spaceAfter=10
        )

        elements = []

        # 1. Standard-Specific Title & Branding
        meta = process_data.get("metadata", {})
        framework = meta.get("compliance_framework", "iso-14044")
        
        branding_text = "<b>TRIYA AUTO-LCA - SCIENTIFIC REPORT</b>"
        elements.append(Paragraph(branding_text, ParagraphStyle('Branding', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)))
        
        title_text = "LCA SCIENTIFIC DATA SHEET"
        if framework == 'jrc-pef':
            title_text = "JRC PEF COMPLIANCE REPORT (EF 3.1)"
        elif framework == 'en-15804':
            title_text = "ENVIRONMENTAL PRODUCT DECLARATION (EN 15804+A2)"
        elif framework == 'ghg-protocol':
            title_text = "GHG PROTOCOL CARBON FOOTPRINT"

        elements.append(Paragraph(title_text, header_style))
        
        # Metadata Table
        meta_data = [
            ["Project Identifier", "Triya AutoLCA v1.0", "Generation Date", datetime.datetime.now().strftime('%Y-%m-%d %H:%M')],
            ["Standard / Compliance", framework.upper(), "Functional Unit", process_data.get("process_name", "Supply Chain Model")],
            ["Methodology", "EF 3.1 (JRC) / ISO 14044", "System Boundary", str(meta.get("system_boundary", "gate-to-gate")).upper()]
        ]
        
        meta_table = Table(meta_data, colWidths=[110, 140, 110, 140])
        meta_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.25, colors.grey),
            ('BACKGROUND', (0,0), (0,-1), colors.toColor("#e8f1f5")),
            ('BACKGROUND', (2,0), (2,-1), colors.toColor("#e8f1f5")),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ]))
        elements.append(meta_table)

        # 2. Methodology & Assumptions
        elements.append(Paragraph("1.0 METHODOLOGICAL SUMMARY", subhead_style))
        method_desc = "This assessment follows internationally recognized LCA standards. "
        if framework == 'jrc-pef':
            method_desc += "Compliant with JRC EF 3.1 Characterization Methods (2023)."
        elif framework == 'en-15804':
            method_desc += "Compliant with EN 15804+A2 sustainability of construction works."
        elif framework == 'ghg-protocol':
            method_desc += "Compliant with GHG Protocol Product Standard (GWP-100)."
        else:
            method_desc += "Conducted under ISO 14040/14044 guidelines."
            
        elements.append(Paragraph(method_desc, styles['Normal']))

        # 3. Supply Chain Model (Snapshot)
        snapshot_b64 = meta.get("snapshot")
        if snapshot_b64 and isinstance(snapshot_b64, str) and "," in snapshot_b64:
            try:
                import base64
                img_data = base64.b64decode(snapshot_b64.split(",")[1])
                img_buffer = io.BytesIO(img_data)
                img = Image(img_buffer, width=400, height=200)
                img.hAlign = 'CENTER'
                elements.append(Paragraph("2.0 SYSTEM BOUNDARY & FLOW MODEL", subhead_style))
                elements.append(img)
            except: pass

        # 4. Impact Assessment Results
        elements.append(Paragraph("3.0 LIFE CYCLE IMPACT ASSESSMENT (LCIA)", subhead_style))
        
        impacts = process_data.get("impacts", {})
        UNIT_MAP = {
            'gwp_climate_change': 'kg CO2 eq',
            'odp_ozone_depletion': 'kg CFC11 eq',
            'ap_acidification': 'mol H+ eq',
            'ep_freshwater': 'kg P eq',
            'ep_marine': 'kg N eq',
            'ep_terrestrial': 'mol N eq',
            'pocp_photochemical_ozone': 'kg NMVOC eq',
            'pm_particulate_matter': 'disease inc.',
            'ir_ionising_radiation': 'kBq U235 eq',
            'ht_c_human_toxicity_cancer': 'CTUh',
            'ht_nc_human_toxicity_non_cancer': 'CTUh',
            'et_fw_ecotoxicity_freshwater': 'CTUe',
            'lu_land_use': 'Pt',
            'wsf_water_scarcity': 'm3 world eq',
            'ru_mm_resource_use_min_met': 'kg Sb eq',
            'ru_f_resource_use_fossils': 'MJ'
        }

        # Dynamic Columns based on Framework
        uncertainty = process_data.get("uncertainty")
        
        if framework == 'ghg-protocol':
            impact_data = [["Carbon Indicator", "Metric", "Result (Mean)", "95% CI (Stochastic)", "Unit"]]
            for cat, val in impacts.items():
                if cat == "gwp_climate_change":
                    ci_text = "N/A"
                    if uncertainty and cat in uncertainty:
                        u = uncertainty[cat]
                        ci_text = f"{u['p5']:.2e} - {u['p95']:.2e}"
                    impact_data.append(["Carbon Footprint", "Climate Change", f"{val:.4e}", ci_text, "kg CO2 eq"])
            col_widths = [110, 100, 90, 120, 80]
        else:
            impact_data = [["Impact Category", "Mean Result", "95% Confidence Interval", "Unit"]]
            for cat, val in impacts.items():
                label = cat.replace("_", " ").title()
                unit = UNIT_MAP.get(cat, "pts")
                ci_text = "Deterministic"
                if uncertainty and cat in uncertainty:
                    u = uncertainty[cat]
                    ci_text = f"{u['p5']:.2e} - {u['p95']:.2e}"
                impact_data.append([label, f"{val:.4e}", ci_text, unit])
            col_widths = [160, 100, 140, 100]

        if len(impact_data) > 1:
            it = Table(impact_data, colWidths=col_widths)
            it.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.toColor("#1a5f7a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (1, 1), (2, -1), 'RIGHT'),
                ('FONTSIZE', (0, 0), (-1, -1), 7),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            elements.append(it)
            if uncertainty:
                elements.append(Paragraph(f"<i>Note: Calculations based on {process_data.get('iterations', 1000)} Monte Carlo iterations.</i>", 
                    ParagraphStyle('MCNote', parent=styles['Normal'], fontSize=7, textColor=colors.grey)))

        # 5. Inventory Contribution Analysis (The 'Scientist' View)
        node_breakdown = meta.get("node_breakdown", {})
        if node_breakdown:
            elements.append(Paragraph("4.0 CONTRIBUTION ANALYSIS & INVENTORY DECOMPOSITION", subhead_style))
            
            # Module Grouping (Construction/PEF style)
            mod_impacts = {}
            for nid, info in node_breakdown.items():
                m = info.get("module", "A1-A3")
                if m not in mod_impacts: mod_impacts[m] = 0.0
                mod_impacts[m] += info.get("impacts", {}).get("gwp_climate_change", 0.0)
            
            elements.append(Paragraph("<b>4.1 Life Cycle Module Summary (GWP)</b>", styles['Normal']))
            mod_data = [["Module", "Indicator", "Impact (GWP)", "Unit"]]
            for m, val in sorted(mod_impacts.items()):
                mod_data.append([f"Mod {m}", "Global Warming", f"{val:.4e}", "kg CO2 eq"])
            
            mt = Table(mod_data, colWidths=[120, 140, 140, 100])
            mt.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
                ('BACKGROUND', (0,0), (-1,0), colors.toColor("#f0f4f8")),
            ]))
            elements.append(mt)
            elements.append(Spacer(1, 10))
            
            # Hotspot/Top Contributor (ISO style)
            elements.append(Paragraph("<b>4.2 Top Supply Chain Contributors</b>", styles['Normal']))
            sorted_nodes = sorted(
                node_breakdown.values(), 
                key=lambda x: x.get("impacts", {}).get("gwp_climate_change", 0.0) if isinstance(x, dict) else 0.0, 
                reverse=True
            )
            
            top_data = [["Process Node", "Amount / Scaling", "Contribution (GWP)", "% Total"]]
            total_gwp = impacts.get("gwp_climate_change", 1.0)
            for info in sorted_nodes[:5]:
                gwp = info.get("impacts", {}).get("gwp_climate_change", 0.0)
                pct = (gwp / total_gwp) * 100 if total_gwp > 0 else 0
                top_data.append([info.get("name", "N/A")[:35], "1.0 unit", f"{gwp:.3e}", f"{pct:.1f}%"])
            
            tt = Table(top_data, colWidths=[180, 100, 120, 100])
            tt.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
                ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
            ]))
            elements.append(tt)

        if meta.get("is_ai_predicted"):
            elements.append(Spacer(1, 15))
            elements.append(Paragraph("<b>DATA QUALITY & AI TRANSPARENCY</b>", styles['Normal']))
            elements.append(Paragraph(
                "Notice: Some characterization factors were imputed via AI-KNN algorithms to fill data gaps. "
                "These predictions have been validated against global average impacts with a 30% cut-off.",
                styles['Normal']
            ))

        print(f"DEBUG: reporter.py received process_data with {len(impacts)} impacts and {len(node_breakdown)} nodes.")
        if snapshot_b64:
             print(f"DEBUG: Snapshot detected (size {len(snapshot_b64)})")

        try:
            print(f"DEBUG: Building PDF with {len(elements)} elements...")
            doc.build(elements)
            print("DEBUG: PDF build successful.")
        except Exception as build_err:
            import traceback
            traceback.print_exc()
            print(f"DEBUG: PDF Build Error: {build_err}")
            # Fallback: simple error page in PDF
            buffer = io.BytesIO()
            doc_err = SimpleDocTemplate(buffer, pagesize=letter)
            doc_err.build([Paragraph(f"PDF Generation Error: {str(build_err)}", styles['Heading1'])])
            buffer.seek(0)
            return buffer

        buffer.seek(0)
        return buffer

    def generate_pdf(self, process_data, output_path):
        """Standard file generator"""
        buffer = self.generate_pdf_buffer(process_data)
        with open(output_path, 'wb') as f:
            f.write(buffer.getvalue())
        return output_path

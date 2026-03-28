import { Node, Edge } from "@xyflow/react";

export interface Archetype {
  id: string;
  name: string;
  category: "Industrial" | "Consumer" | "Digital" | "Bio-Based";
  description: string;
  unit: string;
  flow: number;
  nodes: Node[];
  edges: Edge[];
}

export const INDUSTRY_ARCHETYPES: Archetype[] = [
  {
    id: "aerospace",
    name: "Aerospace: Titanium Supply Chain",
    category: "Industrial",
    description: "Multi-stage titanium processing with feedback loops for swarf recycling.",
    unit: "1 Turbofan Blade",
    flow: 1.0,
    nodes: [
      { id: "A1", type: "process", position: { x: 100, y: 300 }, data: { label: "Kroll Process Extraction", inputs: ["Rutile"], outputs: ["Ti Sponge"], lcia_impacts: {"Climate Change (kg CO2-eq)": 45.2}, mfa_parameters: {transfer_coefficients: [{rate: 0.9}]}, lci_parameters: {flow_classification: "Technosphere Flows", allocation_method: "Physical"} } },
      { id: "A2", type: "process", position: { x: 400, y: 300 }, data: { label: "Vacuum Arc Remelting", inputs: ["Ti Sponge"], outputs: ["Ti Ingot"], lcia_impacts: {"Climate Change (kg CO2-eq)": 23.1}, mfa_parameters: {transfer_coefficients: [{rate: 0.95}]} } },
      { id: "A3", type: "process", position: { x: 700, y: 300 }, data: { label: "5-Axis CNC Machining", inputs: ["Ti Ingot"], outputs: ["Turbofan Blade"], lcia_impacts: {"Climate Change (kg CO2-eq)": 12.0}, mfa_parameters: {transfer_coefficients: [{rate: 0.2}]} } },
    ],
    edges: [
      { id: "ea1", source: "A1", target: "A2", type: "circular", animated: true },
      { id: "ea2", source: "A2", target: "A3", type: "circular", animated: true },
      { id: "ea3", source: "A3", target: "A2", type: "circular", animated: true, style: {strokeDasharray: "6 6"}, label: "Titanium Swarf Recycling", data: { isFeedbackLoop: true } }
    ]
  },
  {
    id: "renewables",
    name: "Renewables: Offshore Wind Lifecycle",
    category: "Industrial",
    description: "Rare earth magnet production and marine deployment logistics.",
    unit: "1 Offshore Turbine Lifecycle",
    flow: 1.0,
    nodes: [
      { id: "R1", type: "process", position: { x: 100, y: 200 }, data: { label: "NdFeB Magnet Production", lcia_impacts: {"Climate Change (kg CO2-eq)": 89.4}, mfa_parameters: {transfer_coefficients: [{rate: 0.85}]} } },
      { id: "R2", type: "process", position: { x: 400, y: 200 }, data: { label: "Marine Logistics (JUV)", lcia_impacts: {"Climate Change (kg CO2-eq)": 210.5}, mfa_parameters: {transfer_coefficients: [{rate: 1.0}]} } },
      { id: "R3", type: "process", position: { x: 700, y: 200 }, data: { label: "Rotor Blade Pyrolysis (End of Life)", lcia_impacts: {"Climate Change (kg CO2-eq)": 15.2}, mfa_parameters: {transfer_coefficients: [{rate: 0.4}]} } },
    ],
    edges: [
      { id: "er1", source: "R1", target: "R2", type: "circular", animated: true },
      { id: "er2", source: "R2", target: "R3", type: "circular", animated: true }
    ]
  },
  {
    id: "pharma",
    name: "Pharma: Biopharmaceutical mAb Line",
    category: "Bio-Based",
    description: "Single-use bioreactor systems and biohazardous waste sterilization.",
    unit: "1000 mAb Vials",
    flow: 1000.0,
    nodes: [
      { id: "P1", type: "process", position: { x: 100, y: 150 }, data: { label: "Single-Use Bioreactor Bags", lcia_impacts: {"Climate Change (kg CO2-eq)": 8.5}, mfa_parameters: {transfer_coefficients: [{rate: 0.99}]} } },
      { id: "P2", type: "process", position: { x: 400, y: 150 }, data: { label: "Ultra-Low Temp Freezers", lcia_impacts: {"Climate Change (kg CO2-eq)": 450.0}, mfa_parameters: {transfer_coefficients: [{rate: 1.0}]} } },
      { id: "P3", type: "process", position: { x: 700, y: 150 }, data: { label: "Biohazardous Steam Autoclave", lcia_impacts: {"Climate Change (kg CO2-eq)": 55.2}, mfa_parameters: {transfer_coefficients: [{rate: 1.0}]} } },
    ],
    edges: [
      { id: "ep1", source: "P1", target: "P2", type: "circular", animated: true },
      { id: "ep2", source: "P2", target: "P3", type: "circular", animated: true },
      { id: "ep3", source: "P3", target: "P1", type: "circular", animated: true, label: "Sterilized Bag Return", data: { isFeedbackLoop: true } }
    ]
  },
  {
    id: "construction",
    name: "Construction: Low-Carbon Concrete",
    category: "Industrial",
    description: "Cement production, steel reinforcement, and demolition recovery.",
    unit: "100 m3 Concrete Structure",
    flow: 100.0,
    nodes: [
      { id: "C1", type: "process", position: { x: 50, y: 100 }, data: { label: "Portland Cement (OPC)", inputs: ["Limestone", "Energy"], outputs: ["Cement"], lcia_impacts: {"Climate Change (kg CO2-eq)": 850.0} } },
      { id: "C2", type: "process", position: { x: 300, y: 100 }, data: { label: "Steel Rebar Extrusion", inputs: ["Scrap Steel"], outputs: ["Rebar"], lcia_impacts: {"Climate Change (kg CO2-eq)": 1200.0} } },
      { id: "C3", type: "process", position: { x: 550, y: 100 }, data: { label: "Concrete Mixing & Pour", inputs: ["Cement", "Rebar", "Aggregate"], outputs: ["Structure"], lcia_impacts: {"Climate Change (kg CO2-eq)": 50.0} } },
      { id: "C4", type: "process", position: { x: 800, y: 100 }, data: { label: "End-of-Life Crushing", inputs: ["Structure"], outputs: ["Recycled Aggregate"], lcia_impacts: {"Climate Change (kg CO2-eq)": 10.0} } },
    ],
    edges: [
      { id: "ec1", source: "C1", target: "C3", type: "circular" },
      { id: "ec2", source: "C2", target: "C3", type: "circular" },
      { id: "ec3", source: "C3", target: "C4", type: "circular" },
      { id: "ec4", source: "C4", target: "C3", type: "circular", style: { strokeDasharray: '4' }, label: "Circular Aggregate" }
    ]
  },
  {
    id: "textiles",
    name: "Textiles: Fast Fashion Lifecycle",
    category: "Consumer",
    description: "High water-scarcity dyeing processes and post-consumer disposal.",
    unit: "1000 Cotton T-Shirts",
    flow: 1000.0,
    nodes: [
      { id: "T1", type: "process", position: { x: 50, y: 150 }, data: { label: "PET Synthetic Spinning", inputs: ["Oil"], outputs: ["PET Fiber"], lcia_impacts: {"Climate Change (kg CO2-eq)": 12.5} } },
      { id: "T2", type: "process", position: { x: 300, y: 150 }, data: { label: "Dyeing & Finishing", inputs: ["PET Fiber", "Dye", "Water"], outputs: ["Fabric"], lcia_impacts: {"Water Scarcity (m3-eq)": 45.0, "Climate Change (kg CO2-eq)": 5.2} } },
      { id: "T3", type: "process", position: { x: 550, y: 150 }, data: { label: "Garment Assembly", inputs: ["Fabric"], outputs: ["T-Shirt"], lcia_impacts: {"Climate Change (kg CO2-eq)": 1.1} } },
      { id: "T4", type: "process", position: { x: 800, y: 150 }, data: { label: "Incineration/Landfill", inputs: ["T-Shirt"], outputs: ["Emissions"], lcia_impacts: {"Climate Change (kg CO2-eq)": 2.5} } },
    ],
    edges: [
      { id: "et1", source: "T1", target: "T2", type: "circular" },
      { id: "et2", source: "T2", target: "T3", type: "circular" },
      { id: "et3", source: "T3", target: "T4", type: "circular" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics: High-Density PCB System",
    category: "Digital",
    description: "Silicon fabrication and e-waste hydrometallurgy recovery.",
    unit: "1 Mainboard Assembly",
    flow: 1.0,
    nodes: [
      { id: "E1", type: "process", position: { x: 50, y: 200 }, data: { label: "Silicon Wafer Fabrication", inputs: ["Silicon", "Energy"], outputs: ["Wafer"], lcia_impacts: {"Climate Change (kg CO2-eq)": 4500.0} } },
      { id: "E2", type: "process", position: { x: 300, y: 200 }, data: { label: "PCB Assembly", inputs: ["Wafer", "Copper", "Gold"], outputs: ["PCB"], lcia_impacts: {"Human Toxicity (kg 1,4-DCB)": 85.0, "Climate Change (kg CO2-eq)": 150.0} } },
      { id: "E3", type: "process", position: { x: 550, y: 200 }, data: { label: "Data Center Operations", inputs: ["PCB", "Energy"], outputs: ["Compute"], lcia_impacts: {"Climate Change (kg CO2-eq)": 25.0} } },
      { id: "E4", type: "process", position: { x: 800, y: 200 }, data: { label: "E-Waste Hydrometallurgy", inputs: ["PCB"], outputs: ["Refined Gold"], lcia_impacts: {"Climate Change (kg CO2-eq)": -12.0} } },
    ],
    edges: [
      { id: "ee1", source: "E1", target: "E2", type: "circular" },
      { id: "ee2", source: "E2", target: "E3", type: "circular" },
      { id: "ee3", source: "E2", target: "E4", type: "circular", label: "End-of-Life" }
    ]
  },
  {
    id: "agriculture",
    name: "Agriculture: Dairy Cycle Analysis",
    category: "Bio-Based",
    description: "Methane emissions from fermentation and fertilizer leaching.",
    unit: "1000 Liters Raw Milk",
    flow: 1000.0,
    nodes: [
      { id: "G1", type: "process", position: { x: 50, y: 150 }, data: { label: "NPK Fertilizer Prod.", inputs: ["Natural Gas"], outputs: ["Fertilizer"], lcia_impacts: {"Climate Change (kg CO2-eq)": 3.4} } },
      { id: "G2", type: "process", position: { x: 300, y: 150 }, data: { label: "Crop Cultivation", inputs: ["Fertilizer"], outputs: ["Fodder"], lcia_impacts: {"Eutrophication (kg N-eq)": 0.5, "Climate Change (kg CO2-eq)": 1.2} } },
      { id: "G3", type: "process", position: { x: 550, y: 150 }, data: { label: "Enteric Fermentation", inputs: ["Fodder"], outputs: ["Milk"], lcia_impacts: {"Climate Change (kg CO2-eq)": 15.6} } },
      { id: "G4", type: "process", position: { x: 800, y: 150 }, data: { label: "Cold Chain Logistics", inputs: ["Milk", "Energy"], outputs: ["Packaged Milk"], lcia_impacts: {"Climate Change (kg CO2-eq)": 0.15} } },
    ],
    edges: [
      { id: "eg1", source: "G1", target: "G2", type: "circular" },
      { id: "eg2", source: "G2", target: "G3", type: "circular" },
      { id: "eg3", source: "G3", target: "G4", type: "circular" }
    ]
  },
  {
    id: "automotive",
    name: "Automotive: EV Battery Cycle",
    category: "Industrial",
    description: "Lithium brine extraction and high-entropy pyrometallurgy recovery.",
    unit: "1 Battery Module (80kWh)",
    flow: 1.0,
    nodes: [
      { id: "U1", type: "process", position: { x: 50, y: 250 }, data: { label: "Lithium Extraction (Brine)", inputs: ["Brine"], outputs: ["Li Carbonate"], lcia_impacts: {"Water Scarcity (m3-eq)": 150.0} } },
      { id: "U2", type: "process", position: { x: 300, y: 250 }, data: { label: "Cathode Synthesis (NMC)", inputs: ["Li Carbonate", "Cobalt", "Nickel"], outputs: ["Cathode Material"], lcia_impacts: {"Climate Change (kg CO2-eq)": 15.2} } },
      { id: "U3", type: "process", position: { x: 550, y: 250 }, data: { label: "Battery Cell Assembly", inputs: ["Cathode Material", "Anode"], outputs: ["Battery Cell"], lcia_impacts: {"Climate Change (kg CO2-eq)": 75.0} } },
      { id: "U4", type: "process", position: { x: 800, y: 250 }, data: { label: "End-of-Life Pyrometallurgy", inputs: ["Battery Cell"], outputs: ["Recovered Metals"], lcia_impacts: {"Climate Change (kg CO2-eq)": -15.0} } },
    ],
    edges: [
      { id: "eu1", source: "U1", target: "U2", type: "circular" },
      { id: "eu2", source: "U2", target: "U3", type: "circular" },
      { id: "eu3", source: "U3", target: "U4", type: "circular", label: "Recycling Path" }
    ]
  }
];

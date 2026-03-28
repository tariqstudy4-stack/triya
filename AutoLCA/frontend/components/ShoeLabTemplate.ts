import { type Node, type Edge } from "@xyflow/react";

export const SHOELAB_NODES: Node[] = [
  {
    id: "A0",
    type: "processNode",
    position: { x: 50, y: 50 },
    data: { 
      label: "User Profile Creation",
      category: "Process",
      uuid: "A0-UPC-001",
      costPerUnit: 1.50,
      currency: "USD",
      inputs: [
        { id: "i-user-data", name: "User Name, Age..", amount: 1, unit: "unit", type: "tech" }
      ],
      outputs: [
        { id: "o-profile", name: "User Profile", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-0", name: "Server CO2", amount: 0.05, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A1",
    type: "processNode",
    position: { x: 300, y: 350 },
    data: { 
      label: "Shoe Design",
      category: "Process",
      uuid: "A1-SD-002",
      costPerUnit: 45.00,
      currency: "USD",
      inputs: [
        { id: "i-custom", name: "Customisation Options", amount: 1, unit: "unit", type: "tech" }
      ],
      outputs: [
        { id: "o-spec", name: "Shoe Spec", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-1", name: "Design Energy CO2", amount: 0.2, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A2",
    type: "processNode",
    position: { x: 500, y: 50 },
    data: { 
      label: "Data Processing / Analytics",
      category: "Process",
      uuid: "A2-DPA-003",
      costPerUnit: 0.25,
      currency: "USD",
      inputs: [
        { id: "i-conn", name: "Cloud Connection", amount: 1, unit: "unit", type: "tech" }
      ],
      outputs: [
        { id: "o-sellable", name: "Sellable Data", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-2", name: "Compute Emission", amount: 0.15, unit: "kg", type: "emission" },
        { id: "e-heat", name: "Waste Heat", amount: 0.01, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A3",
    type: "processNode",
    position: { x: 600, y: 600 },
    data: { 
      label: "Component Manufacturing",
      category: "Process",
      uuid: "A3-CM-004",
      costPerUnit: 12.00,
      currency: "USD",
      inputs: [
        { id: "i-raw", name: "Raw Materials", amount: 1200, unit: "kg", type: "tech" }
      ],
      outputs: [
        { id: "o-part", name: "Shoe Part", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-3", name: "Industrial CO2", amount: 45.0, unit: "kg", type: "emission" },
        { id: "e-tox-3", name: "Particulate Matter", amount: 0.02, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A4",
    type: "processNode",
    position: { x: 800, y: 350 },
    data: { 
      label: "Shoe Manufacturing / Remanufacturing",
      category: "Process",
      uuid: "A4-SMR-005",
      costPerUnit: 35.00,
      currency: "USD",
      outputs: [
        { id: "o-shoe", name: "Intelligent Shoe", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-4", name: "3D Print Energy Em.", amount: 12.5, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A5",
    type: "processNode",
    position: { x: 1000, y: 150 },
    data: { 
      label: "Servicing, Refashioning, Repair",
      category: "Process",
      uuid: "A5-SRR-006",
      costPerUnit: 20.00,
      currency: "USD",
      outputs: [
        { id: "o-serv", name: "Services Data", amount: 1, unit: "unit", type: "product" },
        { id: "e-co2-5", name: "Service Logistics", amount: 1.5, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A6",
    type: "processNode",
    position: { x: 1100, y: 500 },
    data: { 
      label: "Shoe Use",
      category: "Process",
      uuid: "A6-SU-007",
      costPerUnit: 0.05,
      currency: "USD",
      outputs: [
        { id: "o-wearing", name: "Wearing Data", amount: 1, unit: "unit", type: "product" },
        { id: "e-micro", name: "Microplastics", amount: 0.001, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "A7",
    type: "processNode",
    position: { x: 1300, y: 650 },
    data: { 
      label: "Disposal",
      category: "Process",
      uuid: "A7-D-008",
      costPerUnit: 5.00,
      currency: "USD",
      outputs: [
        { id: "o-waste", name: "Waste Material", amount: 0.8, unit: "kg", type: "emission" },
        { id: "e-cfc", name: "Landfill Emissivity", amount: 0.0001, unit: "kg", type: "emission" }
      ]
    }
  }
];

export const SHOELAB_EDGES: Edge[] = [
  { id: "e-0-2", source: "A0", target: "A2", animated: true, label: "Subscription" },
  { id: "e-1-4", source: "A1", target: "A4", animated: true, label: "Shoe Spec" },
  { id: "e-3-4", source: "A3", target: "A4", animated: true, label: "Shoe Part" },
  { id: "e-4-6", source: "A4", target: "A6", animated: true, label: "Intelligent Shoe" },
  { id: "e-6-5", source: "A6", target: "A5", animated: true, label: "Worn/Damaged Shoe" },
  { id: "e-6-7", source: "A6", target: "A7", animated: true, label: "End of Life Shoe" },
  { id: "e-5-4", source: "A5", target: "A4", animated: true, label: "Repair Feed", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "e-2-0", source: "A2", target: "A0", animated: true, label: "Analytics Feedback", style: { stroke: "#3b82f6", strokeWidth: 2 } }
];
